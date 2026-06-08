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
  const { projects, applications, receipts } = useProjects();

  const available = projects.filter((p) => p.status === 'OPEN');
  const myApplications = applications.filter((a) => a.freelancerAddress === address);
  const activeJobs = projects.filter(
    (p) => p.freelancerAddress === address && (p.status === 'ASSIGNED' || p.status === 'COMPLETED'),
  );
  const myReceipts = receipts.filter((r) => r.freelancerAddress === address);
  const totalEarnings = myReceipts.length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Available" value={available.length} hint="Open projects to apply" />
      <StatCard label="Applications" value={myApplications.length} hint="Proposals you submitted" />
      <StatCard label="Active jobs" value={activeJobs.length} hint="Assigned or awaiting approval" />
      <StatCard label="Receipts" value={totalEarnings} hint="Completed payments received" />
    </div>
  );
}
