import { Link, NavLink } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import type { Role } from '../types';

const clientNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects/new', label: 'Create Project' },
  { to: '/projects', label: 'Marketplace' },
  { to: '/receipts', label: 'Receipts' },
];

const freelancerNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Marketplace' },
  { to: '/receipts', label: 'Receipts' },
];

function navForRole(role: Role | null) {
  if (role === 'freelancer') return freelancerNav;
  return clientNav;
}

function NavItems({ items, onNavigate }: { items: typeof clientNav; onNavigate?: () => void }) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

export function Sidebar() {
  const { role } = useWallet();
  const items = navForRole(role);

  return (
    <aside className="surface-card-inset hidden w-64 shrink-0 p-4 lg:flex lg:flex-col">
      <div className="mb-6">
        <p className="section-label">Workspace</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">SkillReceipt</h2>
        {role && (
          <p className="mt-1 text-sm capitalize text-slate-500">{role} dashboard</p>
        )}
      </div>
      <nav className="space-y-2">
        <NavItems items={items} />
      </nav>
      <Link
        to="/onboard"
        className="mt-6 block rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        Switch role
      </Link>
    </aside>
  );
}

export function MobileNav() {
  const { role } = useWallet();
  const items = navForRole(role);

  return (
    <nav className="surface-card-inset -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 py-3 lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
