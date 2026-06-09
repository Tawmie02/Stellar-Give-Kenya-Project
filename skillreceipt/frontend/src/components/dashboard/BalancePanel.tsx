import { useWallet } from "../../context/WalletContext";
import { useBalance } from "../../../hooks/useBalance";

export function BalancePanel() {
  const { address } = useWallet();

  const balance = useBalance(address);

  return (
    <div className="surface-card p-6">
      <p className="section-label">
        Balance
      </p>

      <h3 className="mt-3 text-3xl font-semibold">
        {balance} XLM
      </h3>
    </div>
  );
}