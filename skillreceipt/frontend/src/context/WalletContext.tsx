import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  checkFreighterInstallation,
  checkFreighterAuthorization,
  getFreighterAddress,
  requestWalletAccess,
  requestFreighterAuthorization,
} from "../utils/walletConnect";

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  role: "client" | "freelancer" | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  setRole: (role: "client" | "freelancer") => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [role, setRoleState] = useState<"client" | "freelancer" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On mount: silently try to reconnect if the user previously authorized
  useEffect(() => {
    const initWallet = async () => {
      try {
        const isInstalled = await checkFreighterInstallation();
        if (!isInstalled) return;

        const isAuthorized = await checkFreighterAuthorization();
        if (!isAuthorized) return;

        // App was previously authorized — get the address silently (no popup)
        const pubKey = await getFreighterAddress();
        if (pubKey) {
          setAddress(pubKey);
          setConnected(true);
          // Restore saved role
          const savedRole = localStorage.getItem("skillreceipt_role") as
            | "client"
            | "freelancer"
            | null;
          if (savedRole) setRoleState(savedRole);
        }
      } catch (err) {
        console.warn("Wallet auto-reconnect failed:", err);
      }
    };
    initWallet();
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);

    try {
      // Step 1: Check that Freighter is installed
      const isInstalled = await checkFreighterInstallation();
      if (!isInstalled) {
        setError(
          "Freighter wallet extension not found. Please install it first."
        );
        window.open("https://freighter.app", "_blank");
        return;
      }

      // Step 2: Request access — this is the single call that both
      //         authorizes the app AND returns the public key.
      //         It triggers the Freighter popup if not yet authorized.
      const pubKey = await requestWalletAccess();

      if (!pubKey) {
        setError("Connection was denied or no address was returned.");
        return;
      }

      setAddress(pubKey);
      setConnected(true);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setError("Failed to connect to Freighter. Please try again.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setRoleState(null);
    setError(null);
    localStorage.removeItem("skillreceipt_role");
  }, []);

  const setRole = useCallback((newRole: "client" | "freelancer") => {
    setRoleState(newRole);
    localStorage.setItem("skillreceipt_role", newRole);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        address,
        role,
        error,
        connect,
        disconnect,
        setRole,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}