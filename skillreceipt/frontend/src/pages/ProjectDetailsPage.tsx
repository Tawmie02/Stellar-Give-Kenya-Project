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
    requestChanges,
    receipts,
  } = useProjects();

  const [coverLetter, setCoverLetter] = useState('');
  const [applyError, setApplyError] = useState('');
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectedFreelancerAddr, setSelectedFreelancerAddr] = useState('');
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState<'idle' | 'assigning' | 'releasing'>('idle');
  const [modalStep, setModalStep] = useState('');
  const [modalError, setModalError] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');

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

  async function handleConfirmSelect() {
    setModalLoading('assigning');
    setModalError('');
    try {
      setModalStep('Prompting Freighter to sign assigning & deposit transactions...');
      await selectFreelancer(currentProject.id, selectedFreelancerAddr);
      setShowSelectModal(false);
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Failed to assign freelancer and deposit funds.');
    } finally {
      setModalLoading('idle');
      setModalStep('');
    }
  }

  async function handleConfirmRelease() {
    setModalLoading('releasing');
    setModalError('');
    try {
      setModalStep('Prompting Freighter to release escrow and mint receipt...');
      await approveAndRelease(currentProject.id);
      setShowReleaseModal(false);
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Failed to release payment.');
    } finally {
      setModalLoading('idle');
      setModalStep('');
    }
  }

  async function handleSubmitDeliverable(e: React.FormEvent) {
    e.preventDefault();
    if (!deliverableUrl.trim()) return;
    try {
      await markCompleted(currentProject.id);
      localStorage.setItem(
        `skillreceipt_deliverable_${currentProject.id}`,
        JSON.stringify({ url: deliverableUrl.trim(), notes: deliverableNotes.trim() })
      );
      localStorage.removeItem(`skillreceipt_feedback_${currentProject.id}`);
      setDeliverableUrl('');
      setDeliverableNotes('');
    } catch (err) {
      console.error(err);
    }
  }

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setFeedbackError('Write some review feedback before submitting.');
      return;
    }
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      await requestChanges(currentProject.id, feedbackText.trim());
      setShowFeedbackModal(false);
      setFeedbackText('');
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to request changes.');
    } finally {
      setFeedbackLoading(false);
    }
  }

  let savedDeliverable: { url: string; notes: string } | null = null;
  try {
    const rawData = localStorage.getItem(`skillreceipt_deliverable_${currentProject.id}`);
    if (rawData) {
      savedDeliverable = JSON.parse(rawData);
    }
  } catch (e) {
    // ignore
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

          {/* RECOVERY FLOW 1: ASSIGNED BUT NOT FUNDED */}
          {isClient && currentProject.status === 'ASSIGNED' && !currentProject.escrowLocked && (
            <div className="surface-card p-6 border-2 border-amber-200 bg-amber-50/40">
              <p className="section-label text-amber-700">Action Required</p>
              <h2 className="section-title mt-2 text-amber-900 font-semibold">Escrow Funding Pending</h2>
              <p className="mt-2 text-sm text-amber-800 leading-relaxed">
                You have assigned this project to a freelancer, but the budget was not successfully deposited into the escrow smart contract. Please fund the escrow to secure the project.
              </p>
              <button
                type="button"
                className="btn-primary mt-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
                onClick={() => {
                  setSelectedFreelancerAddr(currentProject.freelancerAddress || '');
                  setShowSelectModal(true);
                  setModalError('');
                }}
              >
                Deposit to Escrow
              </button>
            </div>
          )}

          {/* RECOVERY FLOW 2: RELEASED BUT NOT PAID IN REGISTRY/NO RECEIPT */}
          {isClient && currentProject.escrowReleased && currentProject.status !== 'PAID' && (
            <div className="surface-card p-6 border-2 border-amber-200 bg-amber-50/40">
              <p className="section-label text-amber-700">Action Required</p>
              <h2 className="section-title mt-2 text-amber-900 font-semibold">Finalization Pending</h2>
              <p className="mt-2 text-sm text-amber-800 leading-relaxed">
                The escrow payment was successfully released to the freelancer, but the final steps (minting the SkillReceipt or updating the project status) were not completed.
              </p>
              <button
                type="button"
                className="btn-primary mt-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
                onClick={() => {
                  setShowReleaseModal(true);
                  setModalError('');
                }}
              >
                Complete Release &amp; Mint Receipt
              </button>
            </div>
          )}

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

          {role === 'freelancer' && isAssignedFreelancer && currentProject.status === 'ASSIGNED' && (() => {
            const clientFeedback = localStorage.getItem(`skillreceipt_feedback_${currentProject.id}`);
            return (
              <div className="surface-card p-6">
                <p className="section-label">Delivery</p>
                <h2 className="section-title mt-2">Submit deliverables</h2>
                
                {clientFeedback && (
                  <div className="my-4 rounded-2xl bg-amber-50 border border-amber-200/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Revisions Requested by Client</p>
                    <p className="mt-2 text-sm text-amber-800 font-medium leading-relaxed">{clientFeedback}</p>
                  </div>
                )}
                
                <p className="mt-3 text-sm text-slate-600">
                  Provide the link to the completed deliverables and any review notes for the client.
                </p>
                <form className="mt-5 space-y-4" onSubmit={handleSubmitDeliverable}>
                <input
                  type="url"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  placeholder="Deliverable URL (e.g. GitHub Repository)"
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  required
                />
                <textarea
                  className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  placeholder="Review notes for the client (optional)"
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                  Submit Deliverables &amp; Mark Complete
                </button>
              </form>
            </div>
            );
          })()}

          {isClient && currentProject.status === 'COMPLETED' && (
            <div className="surface-card p-6">
              <p className="section-label">Release payment</p>
              <h2 className="section-title mt-2">Approve and release escrow</h2>
              
              {savedDeliverable && (
                <div className="my-5 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted Deliverables</p>
                  <div className="mt-2">
                    <a
                      href={savedDeliverable.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:underline break-all"
                    >
                      {savedDeliverable.url}
                    </a>
                  </div>
                  {savedDeliverable.notes && (
                    <p className="mt-2 text-sm text-slate-600 border-t border-slate-200/60 pt-2">
                      {savedDeliverable.notes}
                    </p>
                  )}
                </div>
              )}
              
              <p className="mt-3 text-sm text-slate-600">
                Confirm delivery to transfer funds and mint a SkillReceipt.
              </p>
               <div className="flex flex-wrap items-center gap-3 mt-4">
                 <button
                   type="button"
                   className="btn-primary"
                   onClick={() => {
                     setShowReleaseModal(true);
                     setModalError('');
                   }}
                 >
                   Approve &amp; release funds
                 </button>
                 <button
                   type="button"
                   className="rounded-xl border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 bg-white hover:bg-red-50/50 transition"
                   onClick={() => {
                     setShowFeedbackModal(true);
                     setFeedbackError('');
                   }}
                 >
                   Request changes
                 </button>
               </div>
            </div>
          )}

          {savedDeliverable && currentProject.status !== 'ASSIGNED' && currentProject.status !== 'COMPLETED' && (
            <div className="surface-card p-6">
              <p className="section-label">Deliverables</p>
              <h2 className="section-title mt-2">Work submission details</h2>
              <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div>
                  <a
                    href={savedDeliverable.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:underline break-all"
                  >
                    {savedDeliverable.url}
                  </a>
                </div>
                {savedDeliverable.notes && (
                  <p className="mt-2 text-sm text-slate-600 border-t border-slate-200/60 pt-2">
                    {savedDeliverable.notes}
                  </p>
                )}
              </div>
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
                  onSelect={() => {
                    setSelectedFreelancerAddr(application.freelancerAddress);
                    setShowSelectModal(true);
                    setModalError('');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HIRE FREELANCER & DEPOSIT ESCROW MODAL */}
      {showSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900">Hire Freelancer &amp; Fund Escrow</h3>
              <p className="mt-2 text-sm text-slate-600">
                You are about to assign this freelancer to your project and deposit the budget into the escrow smart contract.
              </p>
              
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-slate-500">Freelancer</span>
                  <span className="font-mono font-medium text-slate-800">{truncateAddress(selectedFreelancerAddr)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-t border-slate-200/60 mt-2 pt-2">
                  <span className="text-slate-500">Budget (Escrow deposit)</span>
                  <span className="font-bold text-blue-600">{currentProject.amount}</span>
                </div>
              </div>

              {modalStep && (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-blue-50/70 border border-blue-100 px-3.5 py-3 text-xs text-blue-700 font-medium">
                  <svg className="animate-spin h-4 w-4 text-blue-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{modalStep}</span>
                </div>
              )}

              {modalError && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium leading-relaxed">
                  {modalError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4 border-t border-slate-100">
              <button
                type="button"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200/70 transition"
                onClick={() => setShowSelectModal(false)}
                disabled={modalLoading !== 'idle'}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary py-2.5 px-5 text-sm font-semibold flex items-center gap-2"
                onClick={handleConfirmSelect}
                disabled={modalLoading !== 'idle'}
              >
                {modalLoading !== 'idle' ? 'Processing...' : 'Confirm & Fund Escrow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RELEASE PAYMENT & MINT RECEIPT MODAL */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900">Release Payment &amp; Mint Receipt</h3>
              <p className="mt-2 text-sm text-slate-600">
                Are you satisfied with the deliverables? Confirming will release the funds from the escrow contract to the freelancer and mint an immutable SkillReceipt.
              </p>
              
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-slate-500">Freelancer</span>
                  <span className="font-mono font-medium text-slate-800">
                    {currentProject.freelancerAddress ? truncateAddress(currentProject.freelancerAddress) : 'Not assigned'}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1 border-t border-slate-200/60 mt-2 pt-2">
                  <span className="text-slate-500">Release Amount</span>
                  <span className="font-bold text-emerald-600">{currentProject.amount}</span>
                </div>
              </div>

              {modalStep && (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 px-3.5 py-3 text-xs text-emerald-700 font-medium">
                  <svg className="animate-spin h-4 w-4 text-emerald-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{modalStep}</span>
                </div>
              )}

              {modalError && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium leading-relaxed">
                  {modalError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4 border-t border-slate-100">
              <button
                type="button"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200/70 transition"
                onClick={() => setShowReleaseModal(false)}
                disabled={modalLoading !== 'idle'}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary py-2.5 px-5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                onClick={handleConfirmRelease}
                disabled={modalLoading !== 'idle'}
              >
                {modalLoading !== 'idle' ? 'Processing...' : 'Approve & Release'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST CHANGES / REVISION FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleFeedbackSubmit}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">Request Changes</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Provide detailed feedback to the freelancer explaining what needs to be changed or corrected.
                </p>
                
                <textarea
                  className="mt-5 min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Describe requested changes (e.g. Please update the contract connection files...)"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />

                {feedbackError && (
                  <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
                    {feedbackError}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4 border-t border-slate-100">
                <button
                  type="button"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200/70 transition"
                  onClick={() => setShowFeedbackModal(false)}
                  disabled={feedbackLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition"
                  disabled={feedbackLoading}
                >
                  {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
