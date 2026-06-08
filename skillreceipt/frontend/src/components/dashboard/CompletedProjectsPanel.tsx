import { Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useWallet } from '../../context/WalletContext';
import { StatusBadge } from '../StatusBadge';
import { EmptyState } from '../EmptyState';

export function CompletedProjectsPanel() {
  const { address } = useWallet();
  const { projects } = useProjects();

  const completed = projects.filter(
    (p) => p.clientAddress === address && p.status === 'PAID',
  );

  return (
    <div className="surface-card p-6">
      <p className="section-label">Completed projects</p>
      <h2 className="section-title mt-2">Payment history</h2>

      {completed.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No completed projects"
            description="Projects move here after you approve delivery and release escrow funds."
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {completed.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="surface-card-inset block p-4 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{project.amount} released</p>
                </div>
                <StatusBadge status={project.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
