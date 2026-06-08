import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkFreighterInstallation, retrievePublicKey, checkFreighterAuthorization, requestFreighterAuthorization } from '../utils/walletConnect';

interface WalletContextType {
  connected: boolean;
  address: string | null;
  role: 'client' | 'freelancer' | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  setRole: (role: 'client' | 'freelancer') => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [role, setRoleState] = useState<'client' | 'freelancer' | null>(null);

  // Check if already authorized on load
  useEffect(() => {
    const initWallet = async () => {
      const isInstalled = await checkFreighterInstallation();
      if (isInstalled) {
        const isAuthorized = await checkFreighterAuthorization();
        if (isAuthorized) {
          const pubKey = await retrievePublicKey();
          if (pubKey) {
            setAddress(pubKey);
            setConnected(true);
            // Optionally: check local storage to see if they already picked a role
            const savedRole = localStorage.getItem('skillreceipt_role') as 'client' | 'freelancer' | null;
            if (savedRole) setRoleState(savedRole);
          }
        }
      }
    };
    initWallet();
  }, []);

  const connect = async () => {
    const isInstalled = await checkFreighterInstallation();
    if (!isInstalled) {
      alert("Please install the Freighter wallet extension to use SkillReceipt.");
      window.open("https://freighter.app", "_blank");
      return;
    }

    // Ensure the app is allowed before requesting the key
    const isAuthorized = await checkFreighterAuthorization();
    if (!isAuthorized) {
      await requestFreighterAuthorization();
    }

    const pubKey = await retrievePublicKey();
    if (pubKey) {
      setAddress(pubKey);
      setConnected(true);
    }
  };

  const disconnect = () => {
    setConnected(false);
    setAddress(null);
    setRoleState(null);
    localStorage.removeItem('skillreceipt_role');
  };

  const setRole = (newRole: 'client' | 'freelancer') => {
    setRoleState(newRole);
    localStorage.setItem('skillreceipt_role', newRole);
  };

  return (
    <WalletContext.Provider value={{ connected, address, role, connect, disconnect, setRole }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}