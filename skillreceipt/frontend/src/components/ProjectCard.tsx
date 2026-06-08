import { Link } from 'react-router-dom';
import type { Project } from '../types';
import { truncateAddress } from '../utils/format';
import { StatusBadge } from './StatusBadge';

interface ProjectCardProps {
  project: Project;
  applicationCount?: number;
}

export function ProjectCard({ project, applicationCount = 0 }: ProjectCardProps) {
  return (
    <Link to={`/projects/${project.id}`} className="block transition-transform hover:-translate-y-0.5">
      <article className="surface-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="section-label">{project.id}</div>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{project.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">{project.amount}</span>
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
            {applicationCount} application{applicationCount === 1 ? '' : 's'}
          </span>
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">{project.deadline}</span>
          {project.escrowLocked && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
              Escrow locked
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-500">
          <span>Client: {truncateAddress(project.clientAddress)}</span>
          <span>
            {project.freelancerAddress
              ? `Freelancer: ${truncateAddress(project.freelancerAddress)}`
              : 'Awaiting freelancer'}
          </span>
        </div>
      </article>
    </Link>
  );
}
