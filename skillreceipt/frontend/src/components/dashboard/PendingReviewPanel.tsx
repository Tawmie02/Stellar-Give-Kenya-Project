import { Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useWallet } from '../../context/WalletContext';
import { StatusBadge } from '../StatusBadge';

export function PendingReviewPanel() {
  const { address } = useWallet();
  const { projects } = useProjects();

  // Find client projects that are marked COMPLETED (waiting for payout release)
  const pendingReview = projects.filter(
    (p) => p.clientAddress === address && p.status === 'COMPLETED',
  );

  if (pendingReview.length === 0) return null;

  return (
    <div className="surface-card p-6 border border-amber-200/50 bg-amber-50/10">
      <p className="section-label text-amber-700">Reviews Pending</p>
      <h2 className="section-title mt-2">Freelancer submissions waiting for review</h2>

      <div className="mt-5 space-y-4">
        {pendingReview.map((project) => {
          // Attempt to load deliverable link from localStorage
          let savedDeliverable: { url: string; notes: string } | null = null;
          try {
            const rawData = localStorage.getItem(`skillreceipt_deliverable_${project.id}`);
            if (rawData) {
              savedDeliverable = JSON.parse(rawData);
            }
          } catch (e) {
            // ignore
          }

          return (
            <div
              key={project.id}
              className="surface-card-inset p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">{project.id}</span>
                  <StatusBadge status={project.status} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{project.title}</h3>
                <p className="text-xs text-slate-600">Budget: {project.amount}</p>
                
                {savedDeliverable && (
                  <div className="mt-2 text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block">Deliverable link:</span>
                    <a
                      href={savedDeliverable.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-medium hover:underline break-all"
                    >
                      {savedDeliverable.url}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/projects/${project.id}`}
                  className="rounded-xl px-4 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm text-center"
                >
                  Review &amp; Release Payout
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
