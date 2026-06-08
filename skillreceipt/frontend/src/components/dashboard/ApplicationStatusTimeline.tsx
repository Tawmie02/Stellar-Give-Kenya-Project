import { Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useWallet } from '../../context/WalletContext';
import { ApplicationCard } from '../ApplicationCard';
import { EmptyState } from '../EmptyState';

export function ApplicationStatusTimeline() {
  const { address } = useWallet();
  const { projects, applications } = useProjects();

  const myApplications = applications.filter((a) => a.freelancerAddress === address);

  return (
    <div className="surface-card p-6">
      <p className="section-label">My applications</p>
      <h2 className="section-title mt-2">Application status timeline</h2>

      {myApplications.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No applications yet"
            description="Browse open projects and submit a proposal to track your status here."
            actionLabel="Browse marketplace"
            actionTo="/projects"
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {myApplications.map((application) => {
            const project = projects.find((p) => p.id === application.projectId);
            return (
              <div key={application.id}>
                <ApplicationCard application={application} projectTitle={project?.title} />
                {project && (
                  <Link
                    to={`/projects/${project.id}`}
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View project →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
