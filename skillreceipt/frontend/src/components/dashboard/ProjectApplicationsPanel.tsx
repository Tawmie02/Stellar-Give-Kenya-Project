import { Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useWallet } from '../../context/WalletContext';
import { ApplicationCard } from '../ApplicationCard';
import { EmptyState } from '../EmptyState';

export function ProjectApplicationsPanel() {
  const { address } = useWallet();
  const { projects, applications } = useProjects();

  const myProjectIds = new Set(
    projects.filter((p) => p.clientAddress === address).map((p) => p.id),
  );
  const inbox = applications.filter((a) => myProjectIds.has(a.projectId));

  return (
    <div className="surface-card p-6">
      <p className="section-label">Applications</p>
      <h2 className="section-title mt-2">Review and shortlist freelancers</h2>

      {inbox.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No applications yet"
            description="Freelancer proposals will appear here once your open projects receive submissions."
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {inbox.map((application) => {
            const project = projects.find((p) => p.id === application.projectId);
            return (
              <div key={application.id}>
                <ApplicationCard application={application} projectTitle={project?.title} />
                {project && (
                  <Link
                    to={`/projects/${project.id}`}
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Review on project page →
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
