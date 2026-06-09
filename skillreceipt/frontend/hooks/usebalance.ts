import { useEffect, useState } from "react";

export function useBalance(address?: string | null) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!address) return;

    async function loadBalance() {
      /*
      Future:
      Query USDC balance
      Query Stellar balance

      MVP:
      Calculate from escrow records
      */

      setBalance(0);
    }

    loadBalance();
  }, [address]);

  return balance;
}