import type { ProjectStatus } from '../types';

const statusClasses: Record<ProjectStatus, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ASSIGNED: 'bg-blue-50 text-blue-700 ring-blue-200',
  COMPLETED: 'bg-amber-50 text-amber-700 ring-amber-200',
  PAID: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClasses[status]}`}>
      {status}
    </span>
  );
}