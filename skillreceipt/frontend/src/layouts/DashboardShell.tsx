import type { ReactNode } from 'react';
import { Navbar } from '../components/Navbar';
import { MobileNav, Sidebar } from '../components/Sidebar';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="container-shell pb-8 pt-24">
        <MobileNav />
        <div className="flex gap-6">
          <Sidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}
