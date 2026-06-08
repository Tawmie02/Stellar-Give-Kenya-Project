import { useProjects } from '../context/ProjectContext';
import { useWallet } from '../context/WalletContext';
import { ProjectCard } from '../components/ProjectCard';
import { EmptyState } from '../components/EmptyState';
import { DashboardShell } from '../layouts/DashboardShell';

export function MarketplacePage() {
  const { role } = useWallet();
  const { projects, applications } = useProjects();

  const visibleProjects =
    role === 'freelancer'
      ? projects.filter((p) => p.status === 'OPEN')
      : projects;

  return (
    <DashboardShell>
      <section className="surface-card p-6">
        <p className="section-label">Marketplace</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Browse projects</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          {role === 'freelancer'
            ? 'Review active opportunities, check budgets, and apply with a concise proposal.'
            : 'View all published projects across the marketplace.'}
        </p>
      </section>

      <section className="mt-8">
        {visibleProjects.length === 0 ? (
          <EmptyState
            title="No projects to show"
            description={
              role === 'freelancer'
                ? 'Check back when clients publish new escrow-backed projects.'
                : 'Create a project to get started, or wait for other clients to publish work.'
            }
            actionLabel={role === 'client' ? 'Create project' : undefined}
            actionTo={role === 'client' ? '/projects/new' : undefined}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                applicationCount={applications.filter((a) => a.projectId === project.id).length}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
