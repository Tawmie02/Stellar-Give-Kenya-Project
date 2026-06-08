import { useProjects } from '../context/ProjectContext';
import { useWallet } from '../context/WalletContext';
import { ReceiptCard } from '../components/ReceiptCard';
import { EmptyState } from '../components/EmptyState';
import { DashboardShell } from '../layouts/DashboardShell';

export function ReceiptsPage() {
  const { address, role } = useWallet();
  const { receipts } = useProjects();

  const visibleReceipts = receipts.filter((r) =>
    role === 'client' ? r.clientAddress === address : r.freelancerAddress === address,
  );

  return (
    <DashboardShell>
      <section className="surface-card p-6">
        <p className="section-label">Receipts</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Immutable proof of work</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Every completed and paid project resolves into a SkillReceipt record that is easy to verify and hard to dispute.
        </p>
      </section>

      <section className="mt-8">
        {visibleReceipts.length === 0 ? (
          <EmptyState
            title="No receipts yet"
            description="SkillReceipts are minted when a client approves delivery and releases escrow funds."
          />
        ) : (
          <div className="grid gap-6">
            {visibleReceipts.map((receipt) => (
              <ReceiptCard key={receipt.id} receipt={receipt} />
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
