import { receiptContract } from "./contracts";

export const receiptService = {
  async createReceipt(
    projectId: number,
    client: string,
    freelancer: string,
    amount: number
  ) {
    return receiptContract.create_receipt(
      projectId,
      client,
      freelancer,
      amount
    );
  },

  async getReceipt(receiptId: number) {
    return receiptContract.get_receipt(receiptId);
  },
};