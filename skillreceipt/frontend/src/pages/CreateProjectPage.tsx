import { Navigate } from 'react-router-dom';
import { ProjectForm } from '../components/ProjectForm';
import { useWallet } from '../context/WalletContext';
import { DashboardShell } from '../layouts/DashboardShell';

export function CreateProjectPage() {
  const { role } = useWallet();

  if (role === 'freelancer') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardShell>
      <section className="surface-card p-6">
        <p className="section-label">Create project</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Launch a new escrow-backed job</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Keep the create flow short: title, scope, budget, and deadline. The contract layer handles escrow and status tracking.
        </p>
      </section>

      <section className="mt-8 max-w-3xl">
        <ProjectForm />
      </section>
    </DashboardShell>
  );
}
