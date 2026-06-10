import { useEffect, useState } from "react";
import { callReadOnlyContractMethod, addressToScVal } from "../src/utils/contractIntegration";
import { useProjects } from "../src/context/ProjectContext";

const NATIVE_TOKEN_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJTO6AFURMICUBJUYEK2X52LAJT3SIHN5';

export function useBalance(address?: string | null) {
  const [balance, setBalance] = useState(0);
  const { isMockMode } = useProjects();

  useEffect(() => {
    const walletAddress = address;
    if (!walletAddress) return;

    let isMounted = true;

    async function loadBalance() {
      if (!walletAddress) return;
      
      // 1. If in mock mode, return a stable demo balance (10,000 XLM)
      if (isMockMode) {
        if (isMounted) setBalance(10000);
        return;
      }

      // 2. Otherwise query testnet blockchain (only if it is a valid Stellar public key prefix G)
      if (!walletAddress.startsWith('G') || walletAddress.length !== 56) {
        if (isMounted) setBalance(0);
        return;
      }

      try {
        const rawBalance = await callReadOnlyContractMethod(
          NATIVE_TOKEN_ADDRESS,
          "balance",
          [addressToScVal(walletAddress)]
        );
        if (isMounted && rawBalance !== null) {
          // Soroban returns BigInt for balance amount, scale by 10^7
          const parsed = Number(rawBalance) / 10_000_000;
          setBalance(parsed);
        }
      } catch (err) {
        console.warn("Failed to fetch balance from Stellar Testnet:", err);
      }
    }

    loadBalance();

    // Poll balance every 10 seconds
    const interval = setInterval(loadBalance, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [address, isMockMode]);

  return balance;
}