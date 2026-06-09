#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

/// ------------------------------
/// TEST SETUP
/// ------------------------------
fn setup() -> (Env, ReceiptContractClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let contract_id = env.register(ReceiptContract, ());
    let contract_client = ReceiptContractClient::new(&env, &contract_id);

    (env, contract_client, client, freelancer)
}

#[test]
fn test_create_receipt() {
    let (_, contract, client, freelancer) = setup();

    let receipt_id = contract.create_receipt(
        &1u64,
        &client,
        &freelancer,
        &500i128,
    );

    assert_eq!(receipt_id, 1u64);

    let receipt = contract.get_receipt(&1u64);

    assert_eq!(receipt.id, 1u64);
    assert_eq!(receipt.project_id, 1u64);
    assert_eq!(receipt.client, client);
    assert_eq!(receipt.freelancer, freelancer);
    assert_eq!(receipt.amount, 500i128);
}

#[test]
fn test_receipt_counter_increments() {
    let (_, contract, client, freelancer) = setup();

    let id1 = contract.create_receipt(
        &1u64,
        &client,
        &freelancer,
        &100i128,
    );

    let id2 = contract.create_receipt(
        &2u64,
        &client,
        &freelancer,
        &200i128,
    );

    assert_eq!(id1, 1u64);
    assert_eq!(id2, 2u64);
}

#[test]
fn test_get_receipt() {
    let (_, contract, client, freelancer) = setup();

    contract.create_receipt(
        &10u64,
        &client,
        &freelancer,
        &999i128,
    );

    let receipt = contract.get_receipt(&1u64);

    assert_eq!(receipt.amount, 999i128);
    assert_eq!(receipt.project_id, 10u64);
}

#[test]
fn test_receipt_has_timestamp() {
    let (_, contract, client, freelancer) = setup();

    contract.create_receipt(
        &3u64,
        &client,
        &freelancer,
        &300i128,
    );

    let receipt = contract.get_receipt(&1u64);

    // Just verify timestamp field exists (may be 0 in test env)
    let _timestamp = receipt.timestamp;
}