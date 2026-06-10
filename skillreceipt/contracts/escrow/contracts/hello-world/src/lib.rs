#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, token,
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
    pub token: Address,
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
        token: Address,
        project_id: u64,
        client: Address,
        freelancer: Address,
        amount: i128,
    ) {
        client.require_auth();

        // Transfer tokens from the client to the escrow contract
        let client_token = token::Client::new(&env, &token);
        client_token.transfer(&client, &env.current_contract_address(), &amount);

        let escrow = Escrow {
            project_id,
            client: client.clone(),
            freelancer: freelancer.clone(),
            amount,
            status: EscrowStatus::Locked,
            token,
        };

        env.storage()
            .instance()
            .set(&DataKey::Escrow(project_id), &escrow);

        // Emit Stellar Event for escrow deposit
        env.events().publish(
            (soroban_sdk::symbol_short!("escrow"), soroban_sdk::symbol_short!("deposit")),
            (project_id, client, freelancer, amount)
        );
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

        // Emit Stellar Event for completion signal
        env.events().publish(
            (soroban_sdk::symbol_short!("escrow"), soroban_sdk::symbol_short!("complete")),
            (project_id, freelancer)
        );
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

        // Transfer tokens from this contract to the freelancer
        let client_token = token::Client::new(&env, &escrow.token);
        client_token.transfer(&env.current_contract_address(), &escrow.freelancer, &escrow.amount);

        let mut updated = escrow.clone();
        updated.status = EscrowStatus::Released;

        env.storage()
            .instance()
            .set(&DataKey::Escrow(project_id), &updated);

        // Emit Stellar Event for payout release
        env.events().publish(
            (soroban_sdk::symbol_short!("escrow"), soroban_sdk::symbol_short!("release")),
            (project_id, client, escrow.freelancer, escrow.amount)
        );

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