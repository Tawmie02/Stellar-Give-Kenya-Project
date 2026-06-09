import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApplicationCard } from '../components/ApplicationCard';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { useProjects } from '../context/ProjectContext';
import { useWallet } from '../context/WalletContext';
import { DashboardShell } from '../layouts/DashboardShell';
import { truncateAddress } from '../utils/format';

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { address, role } = useWallet();
  const {
    getProject,
    getApplicationsForProject,
    submitApplication,
    selectFreelancer,
    markCompleted,
    approveAndRelease,
    receipts,
  } = useProjects();

  const [coverLetter, setCoverLetter] = useState('');
  const [applyError, setApplyError] = useState('');

  const project = id ? getProject(id) : undefined;

  if (!id || !project) {
    return (
      <DashboardShell>
        <EmptyState
          title="Project not found"
          description="This project does not exist or may have been removed."
          actionLabel="Back to marketplace"
          actionTo="/projects"
        />
      </DashboardShell>
    );
  }

  const currentProject = project;
  const applications = getApplicationsForProject(currentProject.id);
  const isClient = address === currentProject.clientAddress;
  const isAssignedFreelancer = address === currentProject.freelancerAddress;
  const receipt = receipts.find((r) => r.projectId === currentProject.id);
  const hasApplied = applications.some((a) => a.freelancerAddress === address);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    if (!coverLetter.trim()) {
      setApplyError('Write a short cover letter before submitting.');
      return;
    }
    try {
      await submitApplication(currentProject.id, address, coverLetter.trim());
      setCoverLetter('');
      setApplyError('');
    } catch (err: any) {
      console.error(err);
      setApplyError(err.message || 'Failed to submit application.');
    }
  }

  return (
    <DashboardShell>
      <section className="surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">{currentProject.id}</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">{currentProject.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{currentProject.description}</p>
          </div>
          <StatusBadge status={currentProject.status} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <p className="section-label">Project summary</p>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Budget</span>
                <span className="font-medium text-slate-900">{currentProject.amount}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Status</span>
                <span className="font-medium text-slate-900">{currentProject.status}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Deadline</span>
                <span className="font-medium text-slate-900">{currentProject.deadline}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Escrow</span>
                <span className="font-medium text-slate-900">
                  {currentProject.escrowReleased ? 'Released' : currentProject.escrowLocked ? 'Locked' : 'Not locked'}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Client</span>
                <span className="font-medium text-slate-900">{truncateAddress(currentProject.clientAddress)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Freelancer</span>
                <span className="font-medium text-slate-900">
                  {currentProject.freelancerAddress
                    ? truncateAddress(currentProject.freelancerAddress)
                    : 'Not assigned'}
                </span>
              </div>
            </div>
          </div>

          {role === 'freelancer' && currentProject.status === 'OPEN' && !isClient && (
            <div className="surface-card p-6">
              <p className="section-label">Apply</p>
              <h2 className="section-title mt-2">Submit your proposal</h2>
              {hasApplied ? (
                <p className="mt-4 text-sm text-slate-600">You have already applied to this project.</p>
              ) : (
                <form className="mt-5" onSubmit={handleApply}>
                  <textarea
                    className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    placeholder="Brief cover letter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                  {applyError && <p className="mt-2 text-sm text-red-600">{applyError}</p>}
                  <button type="submit" className="btn-primary mt-4">
                    Submit application
                  </button>
                </form>
              )}
            </div>
          )}

          {role === 'freelancer' && isAssignedFreelancer && currentProject.status === 'ASSIGNED' && (
            <div className="surface-card p-6">
              <p className="section-label">Delivery</p>
              <h2 className="section-title mt-2">Mark work complete</h2>
              <p className="mt-3 text-sm text-slate-600">
                Notify the client that deliverables are ready for review.
              </p>
              <button type="button" className="btn-primary mt-4" onClick={() => markCompleted(currentProject.id)}>
                Mark as completed
              </button>
            </div>
          )}

          {isClient && currentProject.status === 'COMPLETED' && (
            <div className="surface-card p-6">
              <p className="section-label">Release payment</p>
              <h2 className="section-title mt-2">Approve and release escrow</h2>
              <p className="mt-3 text-sm text-slate-600">
                Confirm delivery to transfer funds and mint a SkillReceipt.
              </p>
              <button type="button" className="btn-primary mt-4" onClick={() => approveAndRelease(currentProject.id)}>
                Approve &amp; release funds
              </button>
            </div>
          )}

          {receipt && (
            <div className="surface-card p-6">
              <p className="section-label">SkillReceipt</p>
              <h2 className="section-title mt-2">Payment recorded on-chain</h2>
              <p className="mt-3 text-sm text-slate-600">
                Receipt <span className="font-mono">{receipt.id}</span> minted at {receipt.timestamp}
              </p>
              <Link to="/receipts" className="btn-secondary mt-4 inline-flex">
                View all receipts
              </Link>
            </div>
          )}
        </div>

        <div className="surface-card p-6">
          <p className="section-label">Applications</p>
          <h2 className="section-title mt-2">Freelancer submissions</h2>

          {applications.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="No applications yet"
                description="Freelancers can apply while this project is open."
              />
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  showSelectAction={isClient && currentProject.status === 'OPEN'}
                  onSelect={() => selectFreelancer(currentProject.id, application.freelancerAddress)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
