import { useProjects } from '../../context/ProjectContext';
import { useWallet } from '../../context/WalletContext';
import { EmptyState } from '../EmptyState';

export function EarningsPanel() {
  const { address } = useWallet();
  const { receipts } = useProjects();

  const myReceipts = receipts.filter((r) => r.freelancerAddress === address);

  return (
    <div className="surface-card p-6">
      <p className="section-label">Earnings</p>
      <h2 className="section-title mt-2">Payment summary</h2>

      {myReceipts.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No earnings yet"
            description="Completed and approved projects will show payment totals here."
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {myReceipts.map((receipt) => (
            <div key={receipt.id} className="surface-card-inset flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{receipt.projectTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{receipt.timestamp}</p>
              </div>
              <span className="text-sm font-semibold text-emerald-700">{receipt.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
