import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Briefcase, Code2, Wallet, Loader2, AlertCircle } from 'lucide-react';

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function RoleCard({
  title,
  subtitle,
  icon: Icon,
  selected,
  onSelect,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border bg-white p-6 text-left transition-all duration-200 focus:outline-none ${
        selected 
          ? 'border-slate-900 shadow-md ring-1 ring-slate-900' 
          : 'border-slate-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-sm'
      }`}
      aria-pressed={selected}
    >
      <div className={`mb-4 inline-flex rounded-lg p-3 ${selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-base font-bold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-500 leading-relaxed">{subtitle}</div>
    </button>
  );
}

export function Onboarding() {
  const { connected, connecting, address, error, connect, setRole, role } = useWallet();
  const [selection, setSelection] = useState<'client' | 'freelancer' | null>(role);
  const navigate = useNavigate();

  async function handleConnect() {
    await connect();
  }

  function handleContinue() {
    if (!selection) return;
    setRole(selection);
    navigate('/dashboard');
  }

  return (
    <div className="page-shell min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="container-shell py-12">
        <div className="mx-auto max-w-3xl">
          <div className="surface-card p-8 md:p-12 text-center shadow-xl shadow-slate-200/50">
            
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <Wallet className="h-8 w-8" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Select Your Workspace</h1>
            <p className="mt-3 text-base text-slate-600">
              Choose how you want to interact with the SkillReceipt protocol.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <RoleCard
                title="I want to Hire"
                subtitle="Create projects, lock escrow, and release payment securely."
                icon={Briefcase}
                selected={selection === 'client'}
                onSelect={() => setSelection('client')}
              />
              <RoleCard
                title="I want to Work"
                subtitle="Browse verified projects, submit deliverables, and get paid."
                icon={Code2}
                selected={selection === 'freelancer'}
                onSelect={() => setSelection('freelancer')}
              />
            </div>

            {/* Wallet Status Feedback */}
            {connected && address && (
              <div className="mt-8 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 border border-emerald-200 inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Connected: {truncateAddress(address)}
              </div>
            )}

            {/* Error Feedback */}
            {error && (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200 inline-flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {!connected ? (
                <button 
                  type="button" 
                  className="btn-primary w-full sm:w-auto px-8 py-3 text-base flex items-center justify-center gap-2" 
                  onClick={handleConnect}
                  disabled={connecting}
                >
                  {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {connecting ? 'Connecting to Freighter...' : 'Connect Freighter Wallet'}
                </button>
              ) : (
                <button
                  type="button"
                  className={`btn-primary w-full sm:w-auto px-8 py-3 text-base transition-all ${
                    !selection ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                  onClick={handleContinue}
                  disabled={!selection}
                >
                  Enter Dashboard
                </button>
              )}
              <button 
                type="button" 
                className="btn-secondary w-full sm:w-auto px-8 py-3 text-base" 
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}