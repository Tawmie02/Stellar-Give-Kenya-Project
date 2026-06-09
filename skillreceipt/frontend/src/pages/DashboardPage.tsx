import { Link } from 'react-router-dom';
import {
  ActiveJobsPanel,
  ApplicationStatusTimeline,
  AvailableProjectsFeed,
  ClientProjectList,
  ClientStatsCards,
  CompletedProjectsPanel,
  EarningsPanel,
  EscrowSummaryPanel,
  FreelancerStatsCards,
  ProjectApplicationsPanel,
  ReceiptsPanel,
} from '../components/dashboard';
import { useWallet } from '../context/WalletContext';
import { truncateAddress } from '../utils/format';
import { DashboardShell } from '../layouts/DashboardShell';
import { BalancePanel } from "../components/dashboard/BalancePanel";


function ClientDashboard() {
  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="surface-card p-6">
          <p className="section-label">Client dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Manage escrow, applications, and payouts.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Create projects, review freelancer proposals, and release escrow when work is approved.
          </p>
          <Link to="/projects/new" className="btn-primary mt-6 inline-flex">
            Create project
          </Link>
        </div>
        <div className="surface-card p-6">
          <p className="section-label">Workspace</p>
          <div className="mt-3 text-2xl font-semibold capitalize text-slate-900">Client</div>
          <p className="mt-2 text-sm text-slate-600">Fund work in escrow and approve deliverables.</p>
        </div>
      </section>

      <section className="mt-8">
        <ClientStatsCards />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6">
          <ClientProjectList />
          <CompletedProjectsPanel />
        </div>
        <div className="grid gap-6">
          <ProjectApplicationsPanel />
          <EscrowSummaryPanel />
          <ReceiptsPanel />
        </div>
      </section>
    </>
  );
}

function FreelancerDashboard() {
  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="surface-card p-6">
          <p className="section-label">Freelancer dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Find work, deliver, and earn with proof.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Browse open projects, track applications, and receive SkillReceipts when payments are released.
          </p>
          <Link to="/projects" className="btn-primary mt-6 inline-flex">
            Browse projects
          </Link>
        </div>
        <div className="surface-card p-6">
          <p className="section-label">Workspace</p>
          <div className="mt-3 text-2xl font-semibold capitalize text-slate-900">Freelancer</div>
          <p className="mt-2 text-sm text-slate-600">Apply to projects and complete assigned work.</p>
        </div>
      </section>

      <section className="mt-8">
        <FreelancerStatsCards />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6">
          <AvailableProjectsFeed />
          <ActiveJobsPanel />
        </div>
        <div className="grid gap-6">
          <ApplicationStatusTimeline />
          <EarningsPanel />
          <ReceiptsPanel />
        </div>
      </section>
    </>
  );
}

export function DashboardPage() {
  const { role, address } = useWallet();

  return (
    <DashboardShell>
      {address && (
        <p className="mb-6 text-sm text-slate-500">
          Connected as <span className="font-mono text-slate-700">{truncateAddress(address)}</span>
        </p>
      )}
      {role === 'freelancer' ? <FreelancerDashboard /> : <ClientDashboard />}
    </DashboardShell>
  );
}
