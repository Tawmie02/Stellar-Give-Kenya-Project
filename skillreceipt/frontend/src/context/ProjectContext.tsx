import React, { createContext, useCallback, useContext, useState } from 'react';
import type { Application, CreateProjectInput, Project, Receipt, ProjectStatus } from '../types';
import {
  callReadOnlyContractMethod,
  signAndSubmitTransaction,
  getContractAddresses,
  addressToScVal,
  numberToScVal,
  stringToScVal,
} from '../utils/contractIntegration';

interface ProjectContextValue {
  projects: Project[];
  applications: Application[];
  receipts: Receipt[];
  createProject: (input: CreateProjectInput) => Promise<Project>;
  submitApplication: (projectId: string, freelancerAddress: string, coverLetter: string) => Promise<void>;
  selectFreelancer: (projectId: string, freelancerAddress: string) => Promise<void>;
  markCompleted: (projectId: string) => Promise<void>;
  approveAndRelease: (projectId: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  getApplicationsForProject: (projectId: string) => Application[];
  loadOnChainData: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  // Function to load all data from smart contracts
  const loadOnChainData = useCallback(async () => {
    try {
      const addresses = getContractAddresses();
      if (!addresses.projectRegistry) {
        console.warn('Project registry contract address is not configured yet.');
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
          // Determine Escrow status if address is configured
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

          // Parse project status
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

          // Fetch applications for this project
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
      console.error('Failed to load on-chain data:', error);
    }
  }, []);

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      const addresses = getContractAddresses();
      if (!addresses.projectRegistry) {
        throw new Error('Project Registry contract address is not configured.');
      }

      // Convert amount string to number (strip "XLM" if present)
      const rawAmount = parseInt(input.amount.replace(/[^0-9]/g, '')) || 0;

      const args = [
        addressToScVal(input.clientAddress),
        stringToScVal(input.title),
        stringToScVal(input.description),
        numberToScVal(rawAmount),
      ];

      const project_id = await signAndSubmitTransaction(
        addresses.projectRegistry,
        'create_project',
        args,
        input.clientAddress
      );

      await loadOnChainData();

      return {
        id: `SR-${String(project_id).padStart(3, '0')}`,
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
    [loadOnChainData]
  );

  const submitApplication = useCallback(
    async (projectId: string, freelancerAddress: string, coverLetter: string) => {
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
    [loadOnChainData]
  );

  const selectFreelancer = useCallback(
    async (projectId: string, freelancerAddress: string) => {
      const addresses = getContractAddresses();
      if (!addresses.projectRegistry || !addresses.escrow) {
        throw new Error('Required contract addresses are not configured.');
      }

      const numericId = parseInt(projectId.replace('SR-', ''));
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error('Project not found locally.');

      // 1. Assign freelancer in Project Registry
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

      // 2. Deposit funds to Escrow
      const rawAmount = parseInt(project.amount.replace(/[^0-9]/g, '')) || 0;
      const escrowArgs = [
        numberToScVal(numericId),
        addressToScVal(project.clientAddress),
        addressToScVal(freelancerAddress),
        numberToScVal(rawAmount),
      ];
      await signAndSubmitTransaction(
        addresses.escrow,
        'deposit',
        escrowArgs,
        project.clientAddress
      );

      await loadOnChainData();
    },
    [projects, loadOnChainData]
  );

  const markCompleted = useCallback(
    async (projectId: string) => {
      const addresses = getContractAddresses();
      if (!addresses.projectRegistry || !addresses.escrow) {
        throw new Error('Required contract addresses are not configured.');
      }

      const numericId = parseInt(projectId.replace('SR-', ''));
      const project = projects.find((p) => p.id === projectId);
      if (!project || !project.freelancerAddress) throw new Error('Project or freelancer not found.');

      // 1. Mark as completed in Project Registry
      await signAndSubmitTransaction(
        addresses.projectRegistry,
        'mark_completed',
        [numberToScVal(numericId)],
        project.freelancerAddress
      );

      // 2. Mark complete in Escrow
      await signAndSubmitTransaction(
        addresses.escrow,
        'mark_complete',
        [numberToScVal(numericId), addressToScVal(project.freelancerAddress)],
        project.freelancerAddress
      );

      await loadOnChainData();
    },
    [projects, loadOnChainData]
  );

  const approveAndRelease = useCallback(
    async (projectId: string) => {
      const addresses = getContractAddresses();
      if (!addresses.escrow || !addresses.receipt || !addresses.projectRegistry) {
        throw new Error('Required contract addresses are not configured.');
      }

      const numericId = parseInt(projectId.replace('SR-', ''));
      const project = projects.find((p) => p.id === projectId);
      if (!project || !project.freelancerAddress) throw new Error('Project or freelancer not found.');

      // 1. Release escrow payment
      await signAndSubmitTransaction(
        addresses.escrow,
        'release_payment',
        [numberToScVal(numericId), addressToScVal(project.clientAddress)],
        project.clientAddress
      );

      // 2. Mint Receipt
      const rawAmount = parseInt(project.amount.replace(/[^0-9]/g, '')) || 0;
      const receiptArgs = [
        numberToScVal(numericId),
        addressToScVal(project.clientAddress),
        addressToScVal(project.freelancerAddress),
        numberToScVal(rawAmount),
      ];
      await signAndSubmitTransaction(
        addresses.receipt,
        'create_receipt',
        receiptArgs,
        project.clientAddress
      );

      // 3. Mark project paid in Project Registry
      await signAndSubmitTransaction(
        addresses.projectRegistry,
        'mark_paid',
        [numberToScVal(numericId)],
        project.clientAddress
      );

      await loadOnChainData();
    },
    [projects, loadOnChainData]
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
        createProject,
        submitApplication,
        selectFreelancer,
        markCompleted,
        approveAndRelease,
        getProject,
        getApplicationsForProject,
        loadOnChainData,
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
