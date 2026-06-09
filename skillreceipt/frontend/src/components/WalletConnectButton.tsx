import { useWallet } from '../context/WalletContext';
import { Loader2 } from 'lucide-react';

export function WalletConnectButton() {
  const { connected, connecting, address, error, connect, disconnect } = useWallet();

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        <button className="btn-secondary" onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        className="btn-primary flex items-center gap-2"
        onClick={connect}
        disabled={connecting}
      >
        {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
        {connecting ? 'Connecting...' : 'Connect Freighter'}
      </button>
      {error && (
        <p className="text-xs text-red-500 max-w-[200px] text-right">{error}</p>
      )}
    </div>
  );
}