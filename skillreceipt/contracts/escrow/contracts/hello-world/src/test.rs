#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup() -> (Env, EscrowContractClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths(); 

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    let contract_id = env.register(EscrowContract, ());
    let contract_client = EscrowContractClient::new(&env, &contract_id);

    (env, contract_client, client, freelancer)
}

#[test]
fn test_happy_path_escrow() {
    let (_, contract, client, freelancer) = setup();
    let project_id: u64 = 1;
    let amount: i128 = 5000;

    // 1. Deposit
    contract.deposit(&project_id, &client, &freelancer, &amount);

    let state = contract.get_escrow(&project_id);
    assert_eq!(state.amount, amount);
    assert!(matches!(state.status, EscrowStatus::Locked));

    // 2. Mark Complete
    contract.mark_complete(&project_id, &freelancer);

    // 3. Release Payment
    let released_amount = contract.release_payment(&project_id, &client);
    assert_eq!(released_amount, amount);

    let final_state = contract.get_escrow(&project_id);
    assert!(matches!(final_state.status, EscrowStatus::Released));
}

#[test]
#[should_panic(expected = "Only client can release payment")]
fn test_unauthorized_release() {
    let (_, contract, client, freelancer) = setup();
    let project_id: u64 = 2;

    contract.deposit(&project_id, &client, &freelancer, &1000);
    contract.release_payment(&project_id, &freelancer);
}

#[test]
#[should_panic(expected = "Already released")]
fn test_double_release() {
    let (_, contract, client, freelancer) = setup();
    let project_id: u64 = 3;

    contract.deposit(&project_id, &client, &freelancer, &2000);
    contract.release_payment(&project_id, &client);
    contract.release_payment(&project_id, &client);
}