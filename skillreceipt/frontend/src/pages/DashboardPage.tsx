import { Link } from 'react-router-dom';
import {
  ActiveJobsPanel,
  ApplicationStatusTimeline,
  AvailableProjectsFeed,
  ClientProjectList,
  ClientStatsCards,
  CompletedProjectsPanel,
  EscrowSummaryPanel,
  FreelancerStatsCards,
  ProjectApplicationsPanel,
  ReceiptsPanel,
  PendingReviewPanel,
} from '../components/dashboard';
import { useWallet } from '../context/WalletContext';
import { useProjects } from '../context/ProjectContext';
import { truncateAddress } from '../utils/format';
import { DashboardShell } from '../layouts/DashboardShell';


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
        <div className="flex flex-col gap-6">
          <div className="surface-card p-6">
            <p className="section-label">Workspace</p>
            <div className="mt-3 text-2xl font-semibold capitalize text-slate-900">Client</div>
            <p className="mt-2 text-sm text-slate-600">Fund work in escrow and approve deliverables.</p>
          </div>
        </div>
      </section>

      {/* NEW: Reviews Pending section showing deliverables */}
      <section className="mt-8">
        <PendingReviewPanel />
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
        <div className="flex flex-col gap-6">
          <div className="surface-card p-6">
            <p className="section-label">Workspace</p>
            <div className="mt-3 text-2xl font-semibold capitalize text-slate-900">Freelancer</div>
            <p className="mt-2 text-sm text-slate-600">Apply to projects and complete assigned work.</p>
          </div>
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
          <ReceiptsPanel />
        </div>
      </section>
    </>
  );
}
export function DashboardPage() {
  const { role, address } = useWallet();
  const { isMockMode, setIsMockMode, resetMockData } = useProjects();

  return (
    <DashboardShell>
      {/* Demo Mode Controller Banner */}
      <div className={`mb-6 rounded-3xl p-5 border flex flex-wrap items-center justify-between gap-4 transition-all duration-300 ${isMockMode ? 'bg-amber-50/60 border-amber-200/60' : 'bg-emerald-50/50 border-emerald-100'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isMockMode ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isMockMode ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {isMockMode ? 'Demo Mode Active (Local Storage)' : 'Stellar Testnet Connected'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {isMockMode 
              ? 'Using secure offline local state. All creations, proposals, and escrow payments will complete instantly.' 
              : 'Interacting directly with Soroban smart contracts on the Stellar Testnet (requires Freighter).'}
          </p>
        </div>
        <div className="flex gap-2.5">
          {isMockMode && (
            <button
              onClick={resetMockData}
              className="rounded-xl border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              Reset Data
            </button>
          )}
          <button
            onClick={() => setIsMockMode(!isMockMode)}
            className="rounded-xl px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            {isMockMode ? 'Switch to Testnet' : 'Switch to Demo Mode'}
          </button>
        </div>
      </div>

      {address && (
        <p className="mb-6 text-sm text-slate-500">
          Connected as <span className="font-mono text-slate-700">{truncateAddress(address)}</span>
        </p>
      )}
      {role === 'freelancer' ? <FreelancerDashboard /> : <ClientDashboard />}
    </DashboardShell>
  );
}
