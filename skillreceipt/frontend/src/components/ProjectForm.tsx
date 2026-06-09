import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useWallet } from '../context/WalletContext';

interface ProjectFormProps {
  redirectOnSuccess?: boolean;
  compact?: boolean;
}

export function ProjectForm({ redirectOnSuccess = true, compact = false }: ProjectFormProps) {
  const { address } = useWallet();
  const { createProject } = useProjects();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !amount.trim() || !deadline.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!address) {
      setError('Connect your wallet before creating a project.');
      return;
    }

    try {
      const project = await createProject({
        title: title.trim(),
        description: description.trim(),
        amount: amount.trim().includes('XLM') ? amount.trim() : `${amount.trim()} XLM`,
        deadline: deadline.trim(),
        clientAddress: address,
      });

      setTitle('');
      setDescription('');
      setAmount('');
      setDeadline('');
      setError('');

      if (redirectOnSuccess) {
        navigate(`/projects/${project.id}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create project on-chain.');
    }
  }

  return (
    <form className="surface-card p-6" onSubmit={handleSubmit}>
      {!compact && (
        <>
          <h3 className="text-lg font-semibold text-slate-900">Create a project</h3>
          <p className="mt-2 text-sm text-slate-600">Keep the brief concise and the budget explicit.</p>
        </>
      )}

      <div className={`grid gap-4 ${compact ? '' : 'mt-6'}`}>
        <input
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="min-h-32 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          placeholder="Project description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Budget amount (e.g. 1200 XLM)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button type="submit" className="btn-primary mt-6">
        Publish project
      </button>
    </form>
  );
}
