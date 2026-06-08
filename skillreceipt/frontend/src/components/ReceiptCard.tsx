import type { Receipt } from '../types';
import { truncateAddress } from '../utils/format';

export function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <article className="surface-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-label">{receipt.id}</div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{receipt.projectTitle}</h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          SkillReceipt
        </span>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <span className="block text-slate-500">Client</span>
          <span className="font-medium text-slate-900">{truncateAddress(receipt.clientAddress)}</span>
        </div>
        <div>
          <span className="block text-slate-500">Freelancer</span>
          <span className="font-medium text-slate-900">{truncateAddress(receipt.freelancerAddress)}</span>
        </div>
        <div>
          <span className="block text-slate-500">Amount</span>
          <span className="font-medium text-slate-900">{receipt.amount}</span>
        </div>
        <div>
          <span className="block text-slate-500">Timestamp</span>
          <span className="font-medium text-slate-900">{receipt.timestamp}</span>
        </div>
      </div>
    </article>
  );
}
