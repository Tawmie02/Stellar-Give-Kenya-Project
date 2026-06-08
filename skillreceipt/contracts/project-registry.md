# Project Registry Contract

## Responsibilities
- Create projects
- Store projects
- Track freelancer applications
- Assign a freelancer
- Update project status

## Data Models

```rust
pub enum ProjectStatus {
    Open,
    Assigned,
    Completed,
    Paid,
}

pub struct Project {
    pub id: u64,
    pub client: Address,
    pub freelancer: Option<Address>,
    pub title: String,
    pub description: String,
    pub amount: i128,
    pub status: ProjectStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

pub struct Application {
    pub project_id: u64,
    pub freelancer: Address,
    pub cover_letter: String,
    pub created_at: u64,
}
```

## Storage Schema
- `project_seq: u64`
- `project:<id> -> Project`
- `application:<project_id>:<freelancer> -> Application`
- `client_projects:<client> -> Vec<u64>`
- `freelancer_applications:<freelancer> -> Vec<u64>`
- `project_selected_freelancer:<id> -> Address`

## Function Signatures
- `create_project(client, title, description, amount) -> u64`
- `update_project(project_id, title, description, amount) -> ()`
- `submit_application(project_id, freelancer, cover_letter) -> ()`
- `select_freelancer(project_id, freelancer) -> ()`
- `mark_completed(project_id) -> ()`
- `set_paid(project_id) -> ()`
- `get_project(project_id) -> Project`
- `get_applications(project_id) -> Vec<Application>`

## State Rules
- Projects start in `OPEN`.
- Only the client can assign a freelancer.
- Assignment moves the project to `ASSIGNED`.
- Completion moves the project to `COMPLETED`.
- Payment moves the project to `PAID`.