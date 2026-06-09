import { escrowContract } from "./contracts";

export const escrowService = {
  async deposit(
    projectId: number,
    client: string,
    freelancer: string,
    amount: number
  ) {
    return escrowContract.deposit(
      projectId,
      client,
      freelancer,
      amount
    );
  },

  async releasePayment(
    projectId: number,
    client: string
  ) {
    return escrowContract.release_payment(
      projectId,
      client
    );
  },

  async getEscrow(projectId: number) {
    return escrowContract.get_escrow(projectId);
  },
};