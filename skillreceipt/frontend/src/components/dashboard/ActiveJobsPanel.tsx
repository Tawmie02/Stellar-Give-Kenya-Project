import { Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useWallet } from '../../context/WalletContext';
import { StatusBadge } from '../StatusBadge';
import { EmptyState } from '../EmptyState';

export function ActiveJobsPanel() {
  const { address } = useWallet();
  const { projects } = useProjects();

  const activeJobs = projects.filter(
    (p) =>
      p.freelancerAddress === address &&
      (p.status === 'ASSIGNED' || p.status === 'COMPLETED'),
  );

  return (
    <div className="surface-card p-6">
      <p className="section-label">Active jobs</p>
      <h2 className="section-title mt-2">Assigned work tracker</h2>

      {activeJobs.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No active jobs"
            description="Jobs appear here after a client selects you for a project."
            actionLabel="Browse projects"
            actionTo="/projects"
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {activeJobs.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="surface-card-inset block p-4 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{project.amount}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>
              <p className="mt-3 text-xs text-slate-500">Deadline: {project.deadline}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
