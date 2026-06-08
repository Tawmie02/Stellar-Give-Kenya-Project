import { useWallet } from '../context/WalletContext';

export function WalletConnectButton() {
  const { connected, address, connect, disconnect } = useWallet();

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        <button className="btn-secondary" onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <button className="btn-primary" onClick={connect}>
      Connect Freighter
    </button>
  );
}