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
    let contract_id = env.register(ProjectRegistry, ());

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

#[test]
fn test_submit_and_get_applications() {
    let env = Env::default();
    env.mock_all_auths();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let contract_id = env.register(ProjectRegistry, ());
    let contract_client = ProjectRegistryClient::new(&env, &contract_id);

    let project_id = contract_client.create_project(
        &client,
        &String::from_str(&env, "Build dApp"),
        &String::from_str(&env, "Build escrow system"),
        &100i128,
    );

    contract_client.submit_application(
        &project_id,
        &freelancer,
        &String::from_str(&env, "I am a skilled developer"),
    );

    let apps = contract_client.get_applications(&project_id);
    assert_eq!(apps.len(), 1);
    
    let app = apps.get(0).unwrap();
    assert_eq!(app.project_id, project_id);
    assert_eq!(app.freelancer, freelancer);
    assert_eq!(app.cover_letter, String::from_str(&env, "I am a skilled developer"));
}