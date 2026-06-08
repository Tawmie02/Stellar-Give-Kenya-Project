import { Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useWallet } from '../../context/WalletContext';
import { ReceiptCard } from '../ReceiptCard';
import { EmptyState } from '../EmptyState';

export function ReceiptsPanel() {
  const { address, role } = useWallet();
  const { receipts } = useProjects();

  const visibleReceipts = receipts.filter((r) =>
    role === 'client' ? r.clientAddress === address : r.freelancerAddress === address,
  );

  return (
    <div className="surface-card p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-label">Receipts</p>
          <h2 className="section-title mt-2">SkillReceipt records</h2>
        </div>
        {visibleReceipts.length > 0 && (
          <Link to="/receipts" className="btn-ghost shrink-0">
            View all
          </Link>
        )}
      </div>

      {visibleReceipts.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No receipts yet"
            description="Immutable SkillReceipts are minted when escrow funds are released after project approval."
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {visibleReceipts.slice(0, 3).map((receipt) => (
            <ReceiptCard key={receipt.id} receipt={receipt} />
          ))}
        </div>
      )}
    </div>
  );
}
