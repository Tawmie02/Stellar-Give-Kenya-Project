#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

/// ------------------------------
/// TEST SETUP
/// ------------------------------
fn setup() -> Env {
    Env::default()
}

#[test]
fn test_create_receipt() {
    let env = setup();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let receipt_id = ReceiptContractClient::new(&env)
        .create_receipt(
            &env,
            &1u64,
            &client,
            &freelancer,
            &500i128,
        );

    assert_eq!(receipt_id, 1u64);

    let receipt = ReceiptContractClient::new(&env)
        .get_receipt(&env, 1u64);

    assert_eq!(receipt.id, 1u64);
    assert_eq!(receipt.project_id, 1u64);
    assert_eq!(receipt.client, client);
    assert_eq!(receipt.freelancer, freelancer);
    assert_eq!(receipt.amount, 500i128);
}
#[test]
fn test_receipt_counter_increments() {
    let env = setup();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let contract = ReceiptContractClient::new(&env);

    let id1 = contract.create_receipt(
        &env,
        &1u64,
        &client,
        &freelancer,
        &100i128,
    );

    let id2 = contract.create_receipt(
        &env,
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
    let env = setup();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);

    ReceiptContractClient::new(&env)
        .create_receipt(
            &env,
            &10u64,
            &client,
            &freelancer,
            &999i128,
        );

    let receipt = ReceiptContractClient::new(&env)
        .get_receipt(&env, 1u64);

    assert_eq!(receipt.amount, 999i128);
    assert_eq!(receipt.project_id, 10u64);
}
#[test]
fn test_receipt_has_timestamp() {
    let env = setup();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);

    ReceiptContractClient::new(&env)
        .create_receipt(
            &env,
            &3u64,
            &client,
            &freelancer,
            &300i128,
        );

    let receipt = ReceiptContractClient::new(&env)
        .get_receipt(&env, 1u64);

    // Just verify timestamp is non-zero
    assert!(receipt.timestamp > 0);
}