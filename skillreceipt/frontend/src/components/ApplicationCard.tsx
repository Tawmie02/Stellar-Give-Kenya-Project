import type { Application } from '../types';
import { truncateAddress } from '../utils/format';

interface ApplicationCardProps {
  application: Application;
  projectTitle?: string;
  onSelect?: () => void;
  showSelectAction?: boolean;
}

export function ApplicationCard({
  application,
  projectTitle,
  onSelect,
  showSelectAction = false,
}: ApplicationCardProps) {
  return (
    <article className="surface-card-inset p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          {projectTitle && (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{projectTitle}</p>
          )}
          <h4 className="mt-2 text-base font-semibold text-slate-900">
            {truncateAddress(application.freelancerAddress)}
          </h4>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {application.status}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{application.coverLetter}</p>
      {showSelectAction && onSelect && application.status !== 'Accepted' && (
        <button type="button" className="btn-primary mt-4" onClick={onSelect}>
          Select freelancer
        </button>
      )}
    </article>
  );
}
