import { Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useWallet } from '../../context/WalletContext';
import { ProjectCard } from '../ProjectCard';
import { EmptyState } from '../EmptyState';

export function ClientProjectList() {
  const { address } = useWallet();
  const { projects, applications } = useProjects();

  const myProjects = projects.filter(
    (p) => p.clientAddress === address && p.status !== 'PAID',
  );

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="section-label">My projects</p>
          <h2 className="section-title mt-2">Active project pipeline</h2>
        </div>
        <Link to="/projects/new" className="btn-primary shrink-0">
          Create project
        </Link>
      </div>

      {myProjects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first escrow-backed project to start receiving freelancer applications."
          actionLabel="Create project"
          actionTo="/projects/new"
        />
      ) : (
        <div className="grid gap-4">
          {myProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              applicationCount={applications.filter((a) => a.projectId === project.id).length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
