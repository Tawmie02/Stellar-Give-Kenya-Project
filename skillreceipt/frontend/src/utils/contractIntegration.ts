import { Contract, xdr, rpc, TransactionBuilder, Networks, Asset, nativeToScVal, scValToNative, Transaction } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

// Contract addresses (these would be set after deployment)
const CONTRACT_ADDRESSES = {
  projectRegistry: '' as string,
  escrow: '' as string,
  receipt: '' as string,
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
  const source = await rpcClient.getAccount(publicKey);
  
  const contract = new Contract(contractAddress);
  const transaction = new TransactionBuilder(source, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(methodName, ...args))
    .setTimeout(30)
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
  publicKey: string = 'GD6W557U252PBP555H4YEEJ4BBDZ4A5R7NDPQV555GDG3X4BBDZ4A5R7'
): Promise<any> {
  try {
    const simulated = await simulateContractCall(contractAddress, methodName, args, publicKey);
    if (rpc.Api.isSimulationSuccess(simulated) && simulated.result) {
      return scValToNative(simulated.result.retval);
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
    throw new Error(`Simulation failed for ${methodName}: ${JSON.stringify(simulated)}`);
  }
  
  // 3. Assemble transaction (adds ledger footprint and resource fee from simulation) and build
  const assembledTx = rpc.assembleTransaction(tx, simulated).build();
  
  // 4. Sign with Freighter wallet
  const signResult = await signTransaction(assembledTx.toXDR(), {
    networkPassphrase: Networks.TESTNET,
  });
  
  if (signResult.error) {
    throw new Error(`Freighter signing failed: ${signResult.error}`);
  }
  
  // 5. Submit signed transaction
  const submission = await submitTransaction(assembledTx, signResult.signedTxXdr);
  if (submission.status === 'ERROR') {
    throw new Error(`Submission failed: ${JSON.stringify(submission)}`);
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
        if (tr) {
          const invokeHostFunctionResult = tr.invokeHostFunctionResult();
          if (invokeHostFunctionResult && invokeHostFunctionResult.switch().value === 0) {
            return scValToNative(invokeHostFunctionResult.success());
          }
        }
      }
    }
    return true;
  } else {
    thr