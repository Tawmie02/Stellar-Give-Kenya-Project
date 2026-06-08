import React, { createContext, useCallback, useContext, useState } from 'react';
import type { Application, CreateProjectInput, Project, Receipt } from '../types';
import { formatTimestamp } from '../utils/format';

interface ProjectContextValue {
  projects: Project[];
  applications: Application[];
  receipts: Receipt[];
  createProject: (input: CreateProjectInput) => Project;
  submitApplication: (projectId: string, freelancerAddress: string, coverLetter: string) => void;
  selectFreelancer: (projectId: string, freelancerAddress: string) => void;
  markCompleted: (projectId: string) => void;
  approveAndRelease: (projectId: string) => void;
  getProject: (id: string) => Project | undefined;
  getApplicationsForProject: (projectId: string) => Application[];
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

let projectSeq = 0;
let applicationSeq = 0;
let receiptSeq = 0;

function nextId(prefix: string, seq: number) {
  return `${prefix}-${String(seq).padStart(3, '0')}`;
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const createProject = useCallback((input: CreateProjectInput) => {
    projectSeq += 1;
    const project: Project = {
      id: nextId('SR', projectSeq),
      title: input.title,
      description: input.description,
      amount: input.amount,
      deadline: input.deadline,
      clientAddress: input.clientAddress,
      status: 'OPEN',
      escrowLocked: false,
      escrowReleased: false,
      createdAt: formatTimestamp(),
    };
    setProjects((prev) => [project, ...prev]);
    return project;
  }, []);

  const submitApplication = useCallback((projectId: string, freelancerAddress: string, coverLetter: string) => {
    setProjects((currentProjects) => {
      const project = currentProjects.find((p) => p.id === projectId);
      if (!project || project.status !== 'OPEN') return currentProjects;

      setApplications((prev) => {
        const alreadyApplied = prev.some(
          (a) => a.projectId === projectId && a.freelancerAddress === freelancerAddress,
        );
        if (alreadyApplied) return prev;

        applicationSeq += 1;
        return [
          {
            id: nextId('APP', applicationSeq),
            projectId,
            freelancerAddress,
            coverLetter,
            status: 'Pending',
            createdAt: formatTimestamp(),
          },
          ...prev,
        ];
      });

      return currentProjects;
    });
  }, []);

  const selectFreelancer = useCallback((projectId: string, freelancerAddress: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, status: 'ASSIGNED', freelancerAddress, escrowLocked: true }
          : p,
      ),
    );
    setApplications((prev) =>
      prev.map((a) =>
        a.projectId === projectId
          ? { ...a, status: a.freelancerAddress === freelancerAddress ? 'Accepted' : 'Pending' }
          : a,
      ),
    );
  }, []);

  const markCompleted = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId && p.status === 'ASSIGNED' ? { ...p, status: 'COMPLETED' } : p)),
    );
  }, []);

  const approveAndRelease = useCallback((projectId: string) => {
    setProjects((prev) => {
      const project = prev.find((p) => p.id === projectId);
      if (!project || project.status !== 'COMPLETED' || !project.freelancerAddress) return prev;

      receiptSeq += 1;
      const receipt: Receipt = {
        id: nextId('RCPT', receiptSeq),
        projectId: project.id,
        projectTitle: project.title,
        clientAddress: project.clientAddress,
        freelancerAddress: project.freelancerAddress,
        amount: project.amount,
        timestamp: formatTimestamp(),
      };
      setReceipts((r) => [receipt, ...r]);

      return prev.map((p) =>
        p.id === projectId ? { ...p, status: 'PAID', escrowReleased: true } : p,
      );
    });
  }, []);

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  );

  const getApplicationsForProject = useCallback(
    (projectId: string) => applications.filter((a) => a.projectId === projectId),
    [applications],
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
