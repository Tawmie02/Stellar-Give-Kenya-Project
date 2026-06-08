import { Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useWallet } from '../../context/WalletContext';
import { StatusBadge } from '../StatusBadge';
import { truncateAddress } from '../../utils/format';
import { EmptyState } from '../EmptyState';

export function EscrowSummaryPanel() {
  const { address } = useWallet();
  const { projects } = useProjects();

  const activeEscrows = projects.filter(
    (p) => p.clientAddress === address && p.escrowLocked && !p.escrowReleased,
  );

  return (
    <div className="surface-card p-6">
      <p className="section-label">Active escrows</p>
      <h2 className="section-title mt-2">Locked funds summary</h2>

      {activeEscrows.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No active escrows"
            description="Escrow balances appear here after you assign a freelancer to a project."
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {activeEscrows.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="surface-card-inset block p-4 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{project.amount} locked</p>
                </div>
                <StatusBadge status={project.status} />
              </div>
              {project.freelancerAddress && (
                <p className="mt-3 text-xs text-slate-500">
                  Freelancer: {truncateAddress(project.freelancerAddress)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
