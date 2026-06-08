import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { truncateAddress } from '../utils/format';
import { WalletConnectButton } from './WalletConnectButton';

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const { connected, address, role } = useWallet();

  return (
    <header className="fixed left-0 right-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
            SR
          </span>
          <span className="hidden sm:inline">SkillReceipt</span>
        </Link>

        {isLanding ? (
          <nav className="hidden items-center gap-8 md:flex">
            <button
              type="button"
              onClick={() => scrollTo('features')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollTo('how-it-works')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              How it Works
            </button>
          </nav>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            {role && (
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 font-medium capitalize text-slate-700 sm:inline">
                {role}
              </span>
            )}
            {connected && address && (
              <span className="hidden font-mono text-slate-600 md:inline">
                {truncateAddress(address)}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {isLanding ? (
            <Link to="/onboard" className="btn-primary">
              Get Started
            </Link>
          ) : (
            <WalletConnectButton />
          )}
        </div>
      </div>
    </header>
  );
}
