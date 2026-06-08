import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({ title, description, actionLabel, actionTo, onAction, children }: EmptyStateProps) {
  return (
    <div className="surface-card-inset flex flex-col items-center justify-center px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
      {children}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" className="btn-primary mt-6" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
