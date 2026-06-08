import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { connected, role } = useWallet();
  const location = useLocation();

  if (!connected || !role) {
    return <Navigate to="/onboard" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
