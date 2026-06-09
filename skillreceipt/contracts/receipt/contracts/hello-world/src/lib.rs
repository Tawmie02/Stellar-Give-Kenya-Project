#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env,
};

/// ----------------------
/// STORAGE KEY
/// ----------------------
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Receipt(u64),
    Counter,
}

/// ----------------------
/// RECEIPT STRUCT
/// ----------------------
#[derive(Clone)]
#[contracttype]
pub struct Receipt {
    pub id: u64,
    pub project_id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub timestamp: u64,
}

/// ----------------------
/// CONTRACT
/// ----------------------
#[contract]
pub struct ReceiptContract;

#[contractimpl]
impl ReceiptContract {

    /// Create receipt AFTER payment is released
    pub fn create_receipt(
        env: Env,
        project_id: u64,
        client: Address,
        freelancer: Address,
        amount: i128,
    ) -> u64 {

        // ⚠️ In real system: only Escrow contract should call this
        client.require_auth();

        let mut counter: u64 = env.storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0);

        counter += 1;

        let timestamp = env.ledger().timestamp();

        let receipt = Receipt {
            id: counter,
            project_id,
            client,
            freelancer,
            amount,
            timestamp,
        };

        env.storage()
            .instance()
            .set(&DataKey::Receipt(counter), &receipt);

        env.storage()
            .instance()
            .set(&DataKey::Counter, &counter);

        counter
    }

    /// Fetch receipt
    pub fn get_receipt(env: Env, receipt_id: u64) -> Receipt {
        env.storage()
            .instance()
            .get(&DataKey::Receipt(receipt_id))
            .expect("Receipt not found")
    }

    /// Get current receipt counter
    pub fn get_receipt_counter(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;