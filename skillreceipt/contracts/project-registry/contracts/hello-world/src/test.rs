#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_create_project() {
    // 1. Initialize the standard Soroban test environment
    let env = Env::default();
    env.mock_all_auths(); // Automatically handles require_auth calls in tests

    // 2. Generate an address representing the client/user
    let client_user = Address::generate(&env);

    // 3. Register your contract in the test environment to get a valid contract ID
    let contract_id = env.register_contract(None, ProjectRegistry);

    // 4. Instantiate the client using both the env and the contract ID
    let contract_client = ProjectRegistryClient::new(&env, &contract_id);

    // 5. Call create_project (Notice: we REMOVED &env, and passed values directly)
    let project_id = contract_client.create_project(
        &client_user,
        &String::from_str(&env, "Build dApp"),
        &String::from_str(&env, "Build escrow system"),
        &100i128,
    );

    assert_eq!(project_id, 1);

    // 6. Fetch the project using the same client instance (No &env here either)
    let project = contract_client.get_project(&project_id);

    assert_eq!(project.id, 1);
    assert_eq!(project.amount, 100);
}