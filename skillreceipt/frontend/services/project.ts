import { projectContract } from "./contracts";

export const projectService = {
  async createProject(
    client: string,
    title: string,
    description: string,
    amount: number
  ) {
    return projectContract.create_project(
      client,
      title,
      description,
      amount
    );
  },

  async assignFreelancer(
    projectId: number,
    freelancer: string
  ) {
    return projectContract.assign_freelancer(
      projectId,
      freelancer
    );
  },

  async markCompleted(projectId: number) {
    return projectContract.mark_completed(projectId);
  },

  async markPaid(projectId: number) {
    return projectContract.mark_paid(projectId);
  },

  async getProject(projectId: number) {
    return projectContract.get_project(projectId);
  },
};