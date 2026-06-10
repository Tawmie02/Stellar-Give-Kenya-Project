import { useProjects } from '../../context/ProjectContext';
import { useWallet } from '../../context/WalletContext';

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="surface-card-inset p-5">
      <p className="section-label">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{hint}</p>
    </div>
  );
}

export function FreelancerStatsCards() {
  const { address } = useWallet();
  const { projects, receipts } = useProjects();

  const available = projects.filter((p) => p.status === 'OPEN');
  const activeJobs = projects.filter(
    (p) => p.freelancerAddress === address && (p.status === 'ASSIGNED' || p.status === 'COMPLETED'),
  );
  const myReceipts = receipts.filter((r) => r.freelancerAddress === address);
  
  // Calculate total XLM earned from completed and minted receipts
  const totalXlmEarned = myReceipts.reduce((sum, r) => {
    const amt = parseInt(r.amount.replace(/[^0-9]/g, '')) || 0;
    return sum + amt;
  }, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Available Projects" value={available.length} hint="Open projects on feed" />
      <StatCard label="Active Jobs" value={activeJobs.length} hint="Work in progress" />
      <StatCard label="SkillReceipts" value={myReceipts.length} hint="Verified proof-of-work records" />
      <StatCard label="Total Earnings" value={`${totalXlmEarned.toLocaleString()} XLM`} hint="Total payments received" />
    </div>
  );
}
