export type Role = 'client' | 'freelancer';

export type ProjectStatus = 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'PAID';

export type ApplicationStatus = 'Pending' | 'Shortlisted' | 'Accepted';

export interface Project {
  id: string;
  title: string;
  description: string;
  amount: string;
  status: ProjectStatus;
  clientAddress: string;
  freelancerAddress?: string;
  deadline: string;
  escrowLocked: boolean;
  escrowReleased: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  projectId: string;
  freelancerAddress: string;
  coverLetter: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface Receipt {
  id: string;
  projectId: string;
  projectTitle: string;
  clientAddress: string;
  freelancerAddress: string;
  amount: string;
  timestamp: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  amount: string;
  deadline: string;
  clientAddress: string;
}
