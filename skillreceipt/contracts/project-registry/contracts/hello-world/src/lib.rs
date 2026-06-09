#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, String,
};

/// -----------------------------
/// STORAGE KEYS
/// -----------------------------
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    ProjectCounter,
    Project(u64),
}

/// -----------------------------
/// PROJECT STATUS
/// -----------------------------
#[derive(Clone)]
#[contracttype]
pub enum ProjectStatus {
    Open,
    Assigned,
    Completed,
    Paid,
}

/// -----------------------------
/// PROJECT STRUCT
/// -----------------------------
#[derive(Clone)]
#[contracttype]
pub struct Project {
    pub id: u64,
    pub client: Address,
    pub freelancer: Option<Address>,

    pub title: String,
    pub description: String,

    pub amount: i128,

    pub status: ProjectStatus,
}

/// -----------------------------
/// CONTRACT
/// -----------------------------
#[contract]
pub struct ProjectRegistry;

#[contractimpl]
impl ProjectRegistry {

    /// Create a new project
    pub fn create_project(
        env: Env,
        client: Address,
        title: String,
        description: String,
        amount: i128,
    ) -> u64 {

        client.require_auth();

        let mut counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ProjectCounter)
            .unwrap_or(0);

        counter += 1;

        let project = Project {
            id: counter,
            client: client.clone(),
            freelancer: None,
            title,
            description,
            amount,
            status: ProjectStatus::Open,
        };

        env.storage()
            .instance()
            .set(&DataKey::Project(counter), &project);

        env.storage()
            .instance()
            .set(&DataKey::ProjectCounter, &counter);

        counter
    }

    /// Get project details
    pub fn get_project(env: Env, project_id: u64) -> Project {
        env.storage()
            .instance()
            .get(&DataKey::Project(project_id))
            .expect("Project not found")
    }

    /// Assign freelancer to project
    pub fn assign_freelancer(
        env: Env,
        client: Address,
        project_id: u64,
        freelancer: Address,
    ) {

        client.require_auth();

        let mut project: Project = env
            .storage()
            .instance()
            .get(&DataKey::Project(project_id))
            .expect("Project not found");

        if project.client != client {
            panic!("Only client can assign freelancer");
        }

        project.freelancer = Some(freelancer);
        project.status = ProjectStatus::Assigned;

        env.storage()
            .instance()
            .set(&DataKey::Project(project_id), &project);
    }

    /// Mark project as completed (called later by escrow logic or freelancer)
    pub fn mark_completed(
        env: Env,
        project_id: u64,
    ) {
        let mut project: Project = env
            .storage()
            .instance()
            .get(&DataKey::Project(project_id))
            .expect("Project not found");

        project.status = ProjectStatus::Completed;

        env.storage()
            .instance()
            .set(&DataKey::Project(project_id), &project);
    }

    /// Mark project as paid (called after escrow release)
    pub fn mark_paid(
        env: Env,
        project_id: u64,
    ) {
        let mut project: Project = env
            .storage()
            .instance()
            .get(&DataKey::Project(project_id))
            .expect("Project not found");

        project.status = ProjectStatus::Paid;

        env.storage()
            .instance()
            .set(&DataKey::Project(project_id), &project);
    }
}

#[cfg(test)]
mod test;