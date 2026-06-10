import { Contract, xdr, rpc, TransactionBuilder, Networks, Asset, nativeToScVal, scValToNative, Transaction } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

// Contract addresses (these would be set after deployment)
const CONTRACT_ADDRESSES = {
  projectRegistry: 'CBLXTGAFNZ4W3FP534NJJPJLYSIBXELIUCBBJZGMG3R4WCWCH23AXIDJ' as string,
  escrow: 'CCNGA3N7IBBKI6S5RL2CAPJ4EE5DSEZ3AK4UGZALCEQY3HWRM4I67LYL' as string,
  receipt: 'CD4D77ZIU6XLWGXXEO3VSJFRMH5PVUUNKGOEWOYGK5MRE2FLTTYXFS4R' as string,
};

// RPC server URL - using Stellar testnet
const RPC_URL = 'https://soroban-testnet.stellar.org';

/**
 * Initialize the Soroban RPC client
 */
export function getRpcClient(): rpc.Server {
  return new rpc.Server(RPC_URL, {
    allowHttp: true,
  });
}

/**
 * Set contract addresses (to be called after deployment)
 */
export function setContractAddresses(addresses: {
  projectRegistry: string;
  escrow: string;
  receipt: string;
}) {
  CONTRACT_ADDRESSES.projectRegistry = addresses.projectRegistry;
  CONTRACT_ADDRESSES.escrow = addresses.escrow;
  CONTRACT_ADDRESSES.receipt = addresses.receipt;
}

/**
 * Get contract addresses
 */
export function getContractAddresses() {
  return CONTRACT_ADDRESSES;
}

/**
 * Convert a Stellar address to ScVal
 */
export function addressToScVal(address: string): xdr.ScVal {
  return nativeToScVal(address, { type: 'address' });
}

/**
 * Convert a number to ScVal
 */
export function numberToScVal(num: number | bigint): xdr.ScVal {
  return nativeToScVal(num);
}

/**
 * Convert a number or bigint to an i128 ScVal
 */
export function i128ToScVal(num: number | bigint): xdr.ScVal {
  return nativeToScVal(BigInt(num), { type: 'i128' });
}

/**
 * Convert a string to ScVal
 */
export function stringToScVal(str: string): xdr.ScVal {
  return nativeToScVal(str);
}

/**
 * Build a transaction to call a contract method
 */
export async function buildContractTransaction(
  contractAddress: string,
  methodName: string,
  args: xdr.ScVal[],
  publicKey: string
): Promise<Transaction> {
  const rpcClient = getRpcClient();
  let source;
  try {
    source = await rpcClient.getAccount(publicKey);
  } catch (error: any) {
    if (error && (error.status === 404 || (error.message && error.message.includes('not found')))) {
      try {
        console.log(`Account ${publicKey} not found on testnet. Attempting to fund via Friendbot...`);
        const response = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
        if (response.ok) {
          // Wait 2.5 seconds for ledger closure/finalization
          await new Promise((resolve) => setTimeout(resolve, 2500));
          source = await rpcClient.getAccount(publicKey);
        } else {
          throw new Error(`Account not found on testnet and Friendbot funding failed.`);
        }
      } catch (fundErr) {
        throw new Error(`Account ${publicKey} is not funded on testnet. Please fund it first.`);
      }
    } else {
      throw error;
    }
  }
  
  const contract = new Contract(contractAddress);
  const transaction = new TransactionBuilder(source, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(methodName, ...args))
    .setTimeout(300) // Increase to 5 minutes to allow Freighter approval time
    .build();
  
  return transaction;
}

/**
 * Submit a signed transaction to the network
 */
export async function submitTransaction(
  transaction: Transaction,
  signedXdr: string
): Promise<rpc.Api.SendTransactionResponse> {
  const rpcClient = getRpcClient();
  const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET) as Transaction;
  
  const result = await rpcClient.sendTransaction(signedTx);
  return result;
}

/**
 * Simulate a contract call without submitting
 */
export async function simulateContractCall(
  contractAddress: string,
  methodName: string,
  args: xdr.ScVal[],
  publicKey: string
): Promise<rpc.Api.SimulateTransactionResponse> {
  const rpcClient = getRpcClient();
  const transaction = await buildContractTransaction(contractAddress, methodName, args, publicKey);
  
  const result = await rpcClient.simulateTransaction(transaction);
  return result;
}

/**
 * Call a read-only contract method
 */
export async function callReadOnlyContractMethod(
  contractAddress: string,
  methodName: string,
  args: xdr.ScVal[],
  publicKey: string = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUJZGGBAU53D76P77F7QO5R7T4A6ZHO'
): Promise<any> {
  try {
    const simulated = await simulateContractCall(contractAddress, methodName, args, publicKey);
    if (rpc.Api.isSimulationSuccess(simulated) && simulated.result) {
      return safeScValToNative(simulated.result.retval);
    }
    console.warn(`Simulation of ${methodName} returned:`, simulated);
    return null;
  } catch (error) {
    console.error(`Error in callReadOnlyContractMethod for ${methodName}:`, error);
    return null;
  }
}

/**
 * Poll transaction status until it is no longer PENDING
 */
export async function pollTransactionStatus(
  txHash: string
): Promise<rpc.Api.GetTransactionResponse> {
  const rpcClient = getRpcClient();
  let response = await rpcClient.getTransaction(txHash);
  
  let attempts = 0;
  while (response.status === rpc.Api.GetTransactionStatus.NOT_FOUND && attempts < 15) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    response = await rpcClient.getTransaction(txHash);
    attempts++;
  }
  
  return response;
}

/**
 * Helper to build, simulate, sign with Freighter, submit, and wait for confirmation
 */
export async function signAndSubmitTransaction(
  contractAddress: string,
  methodName: string,
  args: xdr.ScVal[],
  publicKey: string
): Promise<any> {
  const rpcClient = getRpcClient();
  
  // 1. Build transaction
  const tx = await buildContractTransaction(contractAddress, methodName, args, publicKey);
  
  // 2. Simulate transaction to estimate resource fees and populate footprint
  const simulated = await rpcClient.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(simulated)) {
    throw new Error('Simulation failed for ' + methodName + ': ' + JSON.stringify(simulated));
  }
  
  // 3. Assemble transaction (adds ledger footprint and resource fee from simulation) and build
  const assembledTx = rpc.assembleTransaction(tx, simulated).build();
  
  // 4. Sign with Freighter wallet
  let signedXdr: string = '';
  try {
    const signResult: any = await signTransaction(assembledTx.toXDR(), {
      networkPassphrase: Networks.TESTNET,
    });
    
    if (signResult && typeof signResult === 'object') {
      if (signResult.error) {
        throw new Error(signResult.error);
      }
      signedXdr = signResult.signedTxXdr;
    } else if (typeof signResult === 'string') {
      signedXdr = signResult;
    }
  } catch (signErr: any) {
    throw new Error('Freighter signing failed: ' + (signErr.message || signErr));
  }
  
  if (!signedXdr) {
    throw new Error('Freighter signing returned empty transaction XDR.');
  }
  
  // 5. Submit signed transaction
  const submission = await submitTransaction(assembledTx, signedXdr);
  if (submission.status === 'ERROR') {
    throw new Error('Submission failed: ' + JSON.stringify(submission));
  }
  
  // 6. Poll transaction status
  const result = await pollTransactionStatus(submission.hash);
  if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
    const successResult = result as rpc.Api.GetSuccessfulTransactionResponse;
    if (successResult.resultXdr) {
      const txResult = successResult.resultXdr.result();
      const results = txResult.results();
      if (results && results.length > 0) {
        const opResult = results[0];
        const tr = opResult.tr();
          const invokeHostFunctionResult = tr.invokeHostFunctionResult();
          if (invokeHostFunctionResult) {
            let isSuccess = false;
            try {
              if (typeof invokeHostFunctionResult.switch === 'function') {
                isSuccess = invokeHostFunctionResult.switch().value === 0;
              } else if (typeof (invokeHostFunctionResult as any).switch === 'object') {
                isSuccess = (invokeHostFunctionResult as any).switch.value === 0;
              } else {
                isSuccess = (invokeHostFunctionResult as any).value === 0 || (invokeHostFunctionResult as any).switch === 0;
              }
            } catch (e) {
              isSuccess = (invokeHostFunctionResult as any).value === 0;
            }
            if (isSuccess) {
              return safeScValToNative(invokeHostFunctionResult.success());
            }
          }
      }
    }
    return true;
  } else {
    throw new Error('Transaction execution failed with status: ' + result.status + '. Detail: ' + JSON.stringify(result));
  }
}

/**
 * Robust fallback parser for Soroban ScVal to prevent minification collisions
 */
export function safeScValToNative(val: any): any {
  if (!val) return null;
  try {
    return scValToNative(val);
  } catch (err) {
    console.warn("scValToNative failed, attempting manual XDR parse:", err);
    try {
      if (typeof val.value === 'function') {
        const v = val.value();
        
        // Handle raw binary buffers representing integers (common in minified stellar-sdk)
        if (v instanceof Uint8Array || (v && v.constructor && v.constructor.name === 'Uint8Array')) {
          let num = BigInt(0);
          for (let i = 0; i < v.length; i++) {
            num = (num << BigInt(8)) + BigInt(v[i]);
          }
          return num;
        }
        
        if (v && typeof v === 'object' && ('value' in v || '_value' in v)) {
          return safeScValToNative(v);
        }
        if (v && typeof v === 'object' && 'high' in v && 'low' in v) {
          return (BigInt(v.high) << BigInt(32)) + BigInt(v.low);
        }
        return v;
      }
      if (val._value !== undefined) {
        return val._value;
      }
      if (val.value !== undefined) {
        return val.value;
      }
    } catch (e) {
      // ignore
    }
    return val.toString ? val.toString() : val;
  }
}

