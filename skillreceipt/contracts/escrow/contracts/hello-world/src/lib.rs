#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env,
};

#[derive(Clone)]
#[contracttype]
pub enum EscrowStatus {
    Locked,
    Released,
}

#[derive(Clone)]
#[contracttype]
pub struct Escrow {
    pub project_id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub status: EscrowStatus,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Escrow(u64),
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {

    /// CLIENT deposits funds into escrow
    pub fn deposit(
        env: Env,
        project_id: u64,
        client: Address,
        freelancer: Address,
        amount: i128,
    ) {
        client.require_auth();

        let escrow = Escrow {
            project_id,
            client: client.clone(),
            freelancer,
            amount,
            status: EscrowStatus::Locked,
        };

        env.storage()
            .instance()
            .set(&DataKey::Escrow(project_id), &escrow);
    }

    /// FREELANCER signals completion (no money movement yet)
    pub fn mark_complete(
        env: Env,
        project_id: u64,
        freelancer: Address,
    ) {
        freelancer.require_auth();

        let escrow: Escrow = env.storage()
            .instance()
            .get(&DataKey::Escrow(project_id))
            .expect("Escrow not found");

        if escrow.freelancer != freelancer {
            panic!("Not assigned freelancer");
        }

        // No status change required for MVP (kept simple)
    }

    /// CLIENT approves + releases funds
    pub fn release_payment(
        env: Env,
        project_id: u64,
        client: Address,
    ) -> i128 {

        client.require_auth();

        let escrow: Escrow = env.storage()
            .instance()
            .get(&DataKey::Escrow(project_id))
            .expect("Escrow not found");

        if escrow.client != client {
            panic!("Only client can release payment");
        }

        if matches!(escrow.status, EscrowStatus::Released) {
            panic!("Already released");
        }

        // ⚠️ In real Stellar integration, you'd transfer tokens here
        // For MVP: we simulate release by returning amount

        let mut updated = escrow.clone();
        updated.status = EscrowStatus::Released;

        env.storage()
            .instance()
            .set(&DataKey::Escrow(project_id), &updated);

        escrow.amount
    }

    /// GET escrow state
    pub fn get_escrow(env: Env, project_id: u64) -> Escrow {
        env.storage()
            .instance()
            .get(&DataKey::Escrow(project_id))
            .expect("Escrow not found")
    }
}

#[cfg(test)]
mod test;