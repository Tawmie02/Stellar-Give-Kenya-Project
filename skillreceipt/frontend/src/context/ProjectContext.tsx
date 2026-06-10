import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import type { Application, CreateProjectInput, Project, Receipt, ProjectStatus } from '../types';
import { useWallet } from './WalletContext';
import {
  callReadOnlyContractMethod,
  signAndSubmitTransaction,
  getContractAddresses,
  addressToScVal,
  numberToScVal,
  i128ToScVal,
  stringToScVal,
} from '../utils/contractIntegration';

const NATIVE_TOKEN_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJTO6AFURMICUBJUYEK2X52LAJT3SIHN5';

interface ProjectContextValue {
  projects: Project[];
  applications: Application[];
  receipts: Receipt[];
  isMockMode: boolean;
  setIsMockMode: (val: boolean) => void;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  submitApplication: (projectId: string, freelancerAddress: string, coverLetter: string) => Promise<void>;
  selectFreelancer: (projectId: string, freelancerAddress: string) => Promise<void>;
  markCompleted: (projectId: string) => Promise<void>;
  approveAndRelease: (projectId: string) => Promise<void>;
  requestChanges: (projectId: string, feedback: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  getApplicationsForProject: (projectId: string) => Application[];
  loadOnChainData: () => Promise<void>;
  resetMockData: () => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

// LocalStorage Helper Keys
const STORAGE_PROJECTS_KEY = 'skillreceipt_mock_projects';
const STORAGE_APPLICATIONS_KEY = 'skillreceipt_mock_applications';
const STORAGE_RECEIPTS_KEY = 'skillreceipt_mock_receipts';
const STORAGE_MOCK_MODE_KEY = 'skillreceipt_mock_mode_flag';

const defaultProjects: Project[] = [
  {
    id: 'SR-001',
    title: 'Stellar Wallet Integration',
    description: 'Implement Freighter wallet support and transaction signing for our decentralized marketplace.',
    amount: '1500 XLM',
    status: 'OPEN',
    clientAddress: 'GD5V57I7D5ZCS7Z5ZCS7Z5ZCS7Z5ZCS7Z5ZCS7Z5ZCS7Z5ZCS7Z5ZCS7Z',
    deadline: 'Flexible',
    escrowLocked: false,
    escrowReleased: false,
    createdAt: 'Recent',
  },
  {
    id: 'SR-002',
    title: 'Soroban Smart Contract Audit',
    description: 'Review our Rust smart contracts for potential security exploits and optimize gas limits.',
    amount: '3000 XLM',
    status: 'OPEN',
    clientAddress: 'GD5V57I7D5ZCS7Z5ZCS7Z5ZCS7Z5ZCS7Z5ZCS7Z5ZCS7Z5ZCS7Z5ZCS7Z',
    deadline: '2 Weeks',
    escrowLocked: false,
    escrowReleased: false,
    createdAt: 'Recent',
  }
];

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [isMockMode, setIsMockModeState] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_MOCK_MODE_KEY);
    return stored === null ? true : stored === 'true'; // Default to mock mode for easy demos!
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const { address } = useWallet();

  const setIsMockMode = useCallback((val: boolean) => {
    localStorage.setItem(STORAGE_MOCK_MODE_KEY, String(val));
    setIsMockModeState(val);
  }, []);

  // Reset helper
  const resetMockData = useCallback(() => {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(defaultProjects));
    localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify([]));
    localStorage.setItem(STORAGE_RECEIPTS_KEY, JSON.stringify([]));
    setProjects(defaultProjects);
    setApplications([]);
    setReceipts([]);
  }, []);

  // Local mock data loader
  const loadMockData = useCallback(() => {
    let mockProjs = localStorage.getItem(STORAGE_PROJECTS_KEY);
    let mockApps = localStorage.getItem(STORAGE_APPLICATIONS_KEY);
    let mockReceipts = localStorage.getItem(STORAGE_RECEIPTS_KEY);

    if (!mockProjs) {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(defaultProjects));
      mockProjs = JSON.stringify(defaultProjects);
    }
    if (!mockApps) {
      localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify([]));
      mockApps = JSON.stringify([]);
    }
    if (!mockReceipts) {
      localStorage.setItem(STORAGE_RECEIPTS_KEY, JSON.stringify([]));
      mockReceipts = JSON.stringify([]);
    }

    setProjects(JSON.parse(mockProjs));
    setApplications(JSON.parse(mockApps));
    setReceipts(JSON.parse(mockReceipts));
  }, []);

  // Function to load all data from smart contracts (or mock fallback)
  const loadOnChainData = useCallback(async () => {
    if (isMockMode) {
      loadMockData();
      return;
    }

    try {
      const addresses = getContractAddresses();
      if (!addresses.projectRegistry) {
        console.warn('Project registry contract address is not configured yet. Switching to mock mode.');
        setIsMockMode(true);
        return;
      }

      // 1. Fetch project counter from Project Registry
      const counterVal = await callReadOnlyContractMethod(
        addresses.projectRegistry,
        'get_project_counter',
        []
      );
      
      const counter = counterVal ? Number(counterVal) : 0;
      const loadedProjects: Project[] = [];
      const loadedApplications: Application[] = [];

      // Fetch details for each project
      for (let i = 1; i <= counter; i++) {
        const projData = await callReadOnlyContractMethod(
          addresses.projectRegistry,
          'get_project',
          [numberToScVal(i)]
        );

        if (projData) {
          let escrowLocked = false;
          let escrowReleased = false;

          if (addresses.escrow) {
            try {
              const escrow = await callReadOnlyContractMethod(
                addresses.escrow,
                'get_escrow',
                [numberToScVal(i)]
              );
              if (escrow) {
                const status = typeof escrow.status === 'string' ? escrow.status : Object.keys(escrow.status)[0];
                escrowLocked = status === 'Locked';
                escrowReleased = status === 'Released';
              }
            } catch (e) {
              // Escrow entry might not exist yet
            }
          }

          const statusVal = typeof projData.status === 'string' ? projData.status : Object.keys(projData.status)[0];
          let status: ProjectStatus = 'OPEN';
          if (statusVal === 'Assigned') status = 'ASSIGNED';
          else if (statusVal === 'Completed') status = 'COMPLETED';
          else if (statusVal === 'Paid') status = 'PAID';

          loadedProjects.push({
            id: `SR-${String(i).padStart(3, '0')}`,
            title: projData.title.toString(),
            description: projData.description.toString(),
            amount: projData.amount.toString() + ' XLM',
            status,
            clientAddress: projData.client,
            freelancerAddress: projData.freelancer || undefined,
            deadline: 'Flexible',
            escrowLocked,
            escrowReleased,
            createdAt: 'Recent',
          });

          const appsData = await callReadOnlyContractMethod(
            addresses.projectRegistry,
            'get_applications',
            [numberToScVal(i)]
          );

          if (Array.isArray(appsData)) {
            for (const app of appsData) {
              loadedApplications.push({
                id: `APP-${i}-${app.freelancer.slice(0, 6)}`,
                projectId: `SR-${String(i).padStart(3, '0')}`,
                freelancerAddress: app.freelancer,
                coverLetter: app.cover_letter.toString(),
                status: projData.freelancer === app.freelancer ? 'Accepted' : 'Pending',
                createdAt: new Date(Number(app.created_at) * 1000).toLocaleDateString(),
              });
            }
          }
        }
      }

      setProjects(loadedProjects);
      setApplications(loadedApplications);

      // 2. Fetch receipts from Receipt Contract
      if (addresses.receipt) {
        try {
          const receiptCounterVal = await callReadOnlyContractMethod(
            addresses.receipt,
            'get_receipt_counter',
            []
          );
          const receiptCounter = receiptCounterVal ? Number(receiptCounterVal) : 0;
          const loadedReceipts: Receipt[] = [];

          for (let i = 1; i <= receiptCounter; i++) {
            const receipt = await callReadOnlyContractMethod(
              addresses.receipt,
              'get_receipt',
              [numberToScVal(i)]
            );
            if (receipt) {
              const matchedProj = loadedProjects.find(
                (p) => p.id === `SR-${String(receipt.project_id).padStart(3, '0')}`
              );
              loadedReceipts.push({
                id: `RCPT-${String(i).padStart(3, '0')}`,
                projectId: `SR-${String(receipt.project_id).padStart(3, '0')}`,
                projectTitle: matchedProj ? matchedProj.title : `Project #${receipt.project_id}`,
                clientAddress: receipt.client,
                freelancerAddress: receipt.freelancer,
                amount: receipt.amount.toString() + ' XLM',
                timestamp: new Date(Number(receipt.timestamp) * 1000).toLocaleDateString(),
              });
            }
          }
          setReceipts(loadedReceipts);
        } catch (e) {
          console.warn('Failed to load receipts:', e);
        }
      }
    } catch (error) {
      console.error('Failed to load on-chain data, falling back to mock mode:', error);
      setIsMockMode(true);
      loadMockData();
    }
  }, [isMockMode, loadMockData, setIsMockMode]);

  useEffect(() => {
    loadOnChainData();

    const interval = setInterval(() => {
      loadOnChainData();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadOnChainData, address]);

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      if (isMockMode) {
        const storedProjects = JSON.parse(localStorage.getItem(STORAGE_PROJECTS_KEY) || '[]');
        const nextIdNumber = storedProjects.length + 1;
        const newProj: Project = {
          id: `SR-${String(nextIdNumber).padStart(3, '0')}`,
          title: input.title,
          description: input.description,
          amount: input.amount,
          deadline: input.deadline,
          clientAddress: input.clientAddress,
          status: 'OPEN',
          escrowLocked: false,
          escrowReleased: false,
          createdAt: new Date().toLocaleDateString(),
        };
        const updated = [...storedProjects, newProj];
        localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(updated));
        setProjects(updated);
        return newProj;
      }

      const addresses = getContractAddresses();
      if (!addresses.projectRegistry) {
        throw new Error('Project Registry contract address is not configured.');
      }

      const rawAmount = parseInt(input.amount.replace(/[^0-9]/g, '')) || 0;

      const args = [
        addressToScVal(input.clientAddress),
        stringToScVal(input.title),
        stringToScVal(input.description),
        i128ToScVal(rawAmount),
      ];

      const project_id = await signAndSubmitTransaction(
        addresses.projectRegistry,
        'create_project',
        args,
        input.clientAddress
      );

      // Sanitize project_id to ensure it is a clean numeric representation
      let cleanId = '0';
      if (typeof project_id === 'bigint' || typeof project_id === 'number') {
        cleanId = String(project_id);
      } else if (project_id) {
        try {
          if (typeof project_id === 'string') {
            cleanId = project_id.replace(/[^0-9]/g, '') || '0';
          } else if (project_id instanceof Uint8Array || typeof project_id === 'object') {
            const arr = Array.from(project_id as any) as number[];
            let num = BigInt(0);
            for (const byte of arr) {
              num = (num << BigInt(8)) + BigInt(byte);
            }
            cleanId = num.toString();
          }
        } catch (e) {
          cleanId = '0';
        }
      }

      await loadOnChainData();

      return {
        id: `SR-${cleanId.padStart(3, '0')}`,
        title: input.title,
        description: input.description,
        amount: input.amount,
        deadline: input.deadline,
        clientAddress: input.clientAddress,
        status: 'OPEN' as ProjectStatus,
        escrowLocked: false,
        escrowReleased: false,
        createdAt: 'Recent',
      };
    },
    [isMockMode, loadOnChainData]
  );

  const submitApplication = useCallback(
    async (projectId: string, freelancerAddress: string, coverLetter: string) => {
      if (isMockMode) {
        const storedApps = JSON.parse(localStorage.getItem(STORAGE_APPLICATIONS_KEY) || '[]');
        const newApp: Application = {
          id: `APP-${projectId}-${freelancerAddress.slice(0, 6)}`,
          projectId,
          freelancerAddress,
          coverLetter,
          status: 'Pending',
          createdAt: new Date().toLocaleDateString(),
        };
        const updated = [...storedApps, newApp];
        localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(updated));
        setApplications(updated);
        return;
      }

      const addresses = getContractAddresses();
      if (!addresses.projectRegistry) {
        throw new Error('Project Registry contract address is not configured.');
      }

      const numericId = parseInt(projectId.replace('SR-', ''));

      const args = [
        numberToScVal(numericId),
        addressToScVal(freelancerAddress),
        stringToScVal(coverLetter),
      ];

      await signAndSubmitTransaction(
        addresses.projectRegistry,
        'submit_application',
        args,
        freelancerAddress
      );

      await loadOnChainData();
    },
    [isMockMode, loadOnChainData]
  );

  const selectFreelancer = useCallback(
    async (projectId: string, freelancerAddress: string) => {
      if (isMockMode) {
        const storedProjects = JSON.parse(localStorage.getItem(STORAGE_PROJECTS_KEY) || '[]');
        const updatedProjs = storedProjects.map((p: Project) => {
          if (p.id === projectId) {
            return {
              ...p,
              freelancerAddress,
              status: 'ASSIGNED' as ProjectStatus,
              escrowLocked: true,
            };
          }
          return p;
        });
        localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(updatedProjs));
        setProjects(updatedProjs);
        return;
      }

      const addresses = getContractAddresses();
      if (!addresses.projectRegistry || !addresses.escrow) {
        throw new Error('Required contract addresses are not configured.');
      }

      const numericId = parseInt(projectId.replace('SR-', ''));
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error('Project not found locally.');

      if (!project.freelancerAddress) {
        const assignArgs = [
          addressToScVal(project.clientAddress),
          numberToScVal(numericId),
          addressToScVal(freelancerAddress),
        ];
        await signAndSubmitTransaction(
          addresses.projectRegistry,
          'assign_freelancer',
          assignArgs,
          project.clientAddress
        );
      }

      if (!project.escrowLocked) {
        const rawAmount = parseInt(project.amount.replace(/[^0-9]/g, '')) || 0;
        const rawAmountStroops = rawAmount * 10_000_000;
        const escrowArgs = [
          addressToScVal(NATIVE_TOKEN_ADDRESS),
          numberToScVal(numericId),
          addressToScVal(project.clientAddress),
          addressToScVal(freelancerAddress),
          i128ToScVal(rawAmountStroops),
        ];
        await signAndSubmitTransaction(
          addresses.escrow,
          'deposit',
          escrowArgs,
          project.clientAddress
        );
      }

      await loadOnChainData();
    },
    [isMockMode, projects, loadOnChainData]
  );

  const markCompleted = useCallback(
    async (projectId: string) => {
      if (isMockMode) {
        const storedProjects = JSON.parse(localStorage.getItem(STORAGE_PROJECTS_KEY) || '[]');
        const updatedProjs = storedProjects.map((p: Project) => {
          if (p.id === projectId) {
            return {
              ...p,
              status: 'COMPLETED' as ProjectStatus,
            };
          }
          return p;
        });
        localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(updatedProjs));
        setProjects(updatedProjs);
        return;
      }

      const addresses = getContractAddresses();
      if (!addresses.projectRegistry || !addresses.escrow) {
        throw new Error('Required contract addresses are not configured.');
      }

      const numericId = parseInt(projectId.replace('SR-', ''));
      const project = projects.find((p) => p.id === projectId);
      if (!project || !project.freelancerAddress) throw new Error('Project or freelancer not found.');

      await signAndSubmitTransaction(
        addresses.projectRegistry,
        'mark_completed',
        [numberToScVal(numericId)],
        project.freelancerAddress
      );

      await signAndSubmitTransaction(
        addresses.escrow,
        'mark_complete',
        [numberToScVal(numericId), addressToScVal(project.freelancerAddress)],
        project.freelancerAddress
      );

      await loadOnChainData();
    },
    [isMockMode, projects, loadOnChainData]
  );

  const approveAndRelease = useCallback(
    async (projectId: string) => {
      if (isMockMode) {
        const storedProjects = JSON.parse(localStorage.getItem(STORAGE_PROJECTS_KEY) || '[]');
        const currentProj = storedProjects.find((p: Project) => p.id === projectId);
        if (!currentProj) throw new Error('Project not found');

        const updatedProjs = storedProjects.map((p: Project) => {
          if (p.id === projectId) {
            return {
              ...p,
              status: 'PAID' as ProjectStatus,
              escrowLocked: false,
              escrowReleased: true,
            };
          }
          return p;
        });
        localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(updatedProjs));
        setProjects(updatedProjs);

        // Mint mock receipt
        const storedReceipts = JSON.parse(localStorage.getItem(STORAGE_RECEIPTS_KEY) || '[]');
        const newReceipt: Receipt = {
          id: `RCPT-${String(storedReceipts.length + 1).padStart(3, '0')}`,
          projectId,
          projectTitle: currentProj.title,
          clientAddress: currentProj.clientAddress,
          freelancerAddress: currentProj.freelancerAddress || '',
          amount: currentProj.amount,
          timestamp: new Date().toLocaleDateString(),
        };
        const updatedReceipts = [...storedReceipts, newReceipt];
        localStorage.setItem(STORAGE_RECEIPTS_KEY, JSON.stringify(updatedReceipts));
        setReceipts(updatedReceipts);
        return;
      }

      const addresses = getContractAddresses();
      if (!addresses.escrow || !addresses.receipt || !addresses.projectRegistry) {
        throw new Error('Required contract addresses are not configured.');
      }

      const numericId = parseInt(projectId.replace('SR-', ''));
      const project = projects.find((p) => p.id === projectId);
      if (!project || !project.freelancerAddress) throw new Error('Project or freelancer not found.');

      if (!project.escrowReleased) {
        await signAndSubmitTransaction(
          addresses.escrow,
          'release_payment',
          [numberToScVal(numericId), addressToScVal(project.clientAddress)],
          project.clientAddress
        );
      }

      const hasReceipt = receipts.some((r) => r.projectId === projectId);
      if (!hasReceipt) {
        const rawAmount = parseInt(project.amount.replace(/[^0-9]/g, '')) || 0;
        const receiptArgs = [
          numberToScVal(numericId),
          addressToScVal(project.clientAddress),
          addressToScVal(project.freelancerAddress),
          i128ToScVal(rawAmount),
        ];
        await signAndSubmitTransaction(
          addresses.receipt,
          'create_receipt',
          receiptArgs,
          project.clientAddress
        );
      }

      if (project.status !== 'PAID') {
        await signAndSubmitTransaction(
          addresses.projectRegistry,
          'mark_paid',
          [numberToScVal(numericId)],
          project.clientAddress
        );
      }

      await loadOnChainData();
    },
    [isMockMode, projects, receipts, loadOnChainData]
  );

  const requestChanges = useCallback(
    async (projectId: string, feedback: string) => {
      if (isMockMode) {
        const storedProjects = JSON.parse(localStorage.getItem(STORAGE_PROJECTS_KEY) || '[]');
        const updatedProjs = storedProjects.map((p: Project) => {
          if (p.id === projectId) {
            return {
              ...p,
              status: 'ASSIGNED' as ProjectStatus,
            };
          }
          return p;
        });
        localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(updatedProjs));
        setProjects(updatedProjs);
        localStorage.setItem(`skillreceipt_feedback_${projectId}`, feedback);
        return;
      }

      throw new Error(
        'State reversion is not supported on-chain by the smart contracts. Reverting to Assigned state is only available in Demo Mode.'
      );
    },
    [isMockMode]
  );

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const getApplicationsForProject = useCallback(
    (projectId: string) => applications.filter((a) => a.projectId === projectId),
    [applications]
  );

  return (
    <ProjectContext.Provider
      value={{
        projects,
        applications,
        receipts,
        isMockMode,
        setIsMockMode,
        createProject,
        submitApplication,
        selectFreelancer,
        markCompleted,
        approveAndRelease,
        requestChanges,
        getProject,
        getApplicationsForProject,
        loadOnChainData,
        resetMockData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used inside ProjectProvider');
  return ctx;
}
