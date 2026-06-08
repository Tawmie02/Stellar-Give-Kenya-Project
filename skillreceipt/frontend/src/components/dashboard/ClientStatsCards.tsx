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

export function ClientStatsCards() {
  const { address } = useWallet();
  const { projects, applications } = useProjects();

  const myProjects = projects.filter((p) => p.clientAddress === address);
  const pendingApplications = applications.filter((a) => {
    const project = projects.find((p) => p.id === a.projectId);
    return project?.clientAddress === address && a.status === 'Pending';
  });
  const activeEscrows = myProjects.filter((p) => p.escrowLocked && !p.escrowReleased);
  const completed = myProjects.filter((p) => p.status === 'PAID');

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="My projects" value={myProjects.length} hint="Total projects you created" />
      <StatCard label="Applications" value={pendingApplications.length} hint="Pending freelancer submissions" />
      <StatCard label="Active escrows" value={activeEscrows.length} hint="Funds locked in escrow" />
      <StatCard label="Completed" value={completed.length} hint="Paid and receipted projects" />
    </div>
  );
}
