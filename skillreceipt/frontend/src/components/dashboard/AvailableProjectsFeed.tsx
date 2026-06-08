import { Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { ProjectCard } from '../ProjectCard';
import { EmptyState } from '../EmptyState';

export function AvailableProjectsFeed() {
  const { projects, applications } = useProjects();
  const openProjects = projects.filter((p) => p.status === 'OPEN');

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="section-label">Available projects</p>
          <h2 className="section-title mt-2">Open marketplace feed</h2>
        </div>
        <Link to="/projects" className="btn-ghost shrink-0">
          View all
        </Link>
      </div>

      {openProjects.length === 0 ? (
        <EmptyState
          title="No open projects"
          description="New client projects will appear here when they are published to the marketplace."
          actionLabel="Browse marketplace"
          actionTo="/projects"
        />
      ) : (
        <div className="grid gap-4">
          {openProjects.slice(0, 4).map((project) => (
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
