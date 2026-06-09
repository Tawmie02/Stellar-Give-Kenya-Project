import { Contract, xdr, SorobanRpc, TransactionBuilder, Networks, Asset, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';

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
export function getRpcClient(): SorobanRpc.Server {
  return new SorobanRpc.Server(RPC_URL, {
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
  const rpc = getRpcClient();
  const source = await rpc.getAccount(publicKey);
  
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
): Promise<SorobanRpc.GetTransactionResponse> {
  const rpc = getRpcClient();
  const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET) as Transaction;
  
  const result = await rpc.sendTransaction(signedTx);
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
): Promise<SorobanRpc.SimulateTransactionResponse> {
  const rpc = getRpcClient();
  const transaction = await buildContractTransaction(contractAddress, methodName, args, publicKey);
  
  const result = await rpc.simulateTransaction(transaction);
  return result;
}

/**
 * Call a read-only contract method
 */
export async function callReadOnlyContractMethod(
  contractAddress: string,
  methodName: string,
  args: xdr.ScVal[]
): Promise<any> {
  const rpc = getRpcClient();
  
  const contract = new Contract(contractAddress);
  const result = await rpc.getLedgerEntries(contract.getFootprint());
  
  if (result.entries && result.entries.length > 0) {
    // This is a simplified approach - in reality you'd need to properly
    // invoke the contract method and parse the result
    return null;
  }
  
  return null;
}
