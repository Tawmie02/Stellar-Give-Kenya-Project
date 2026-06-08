# Smart Contract Design

## Contract 1: Project Registry Contract

### Responsibility
- Create projects
- Store projects
- Collect freelancer applications
- Assign freelancer
- Update project status

### Status Enum
- `OPEN`
- `ASSIGNED`
- `COMPLETED`
- `PAID`

### Data Models

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

### Storage Schema
- `project_seq: u64`
- `project:<id> -> Project`
- `application:<project_id>:<freelancer> -> Application`
- `client_projects:<client> -> Vec<u64>`
- `freelancer_applications:<freelancer> -> Vec<u64>`
- `project_selected_freelancer:<id> -> Address`

### Function Signatures
- `create_project(client, title, description, amount) -> u64`
- `update_project(project_id, title, description, amount) -> ()`
- `submit_application(project_id, freelancer, cover_letter) -> ()`
- `select_freelancer(project_id, freelancer) -> ()`
- `mark_completed(project_id) -> ()`
- `set_paid(project_id) -> ()`
- `get_project(project_id) -> Project`
- `get_applications(project_id) -> Vec<Application>`

---

## Contract 2: Escrow Contract

### Responsibility
- Lock client funds
- Hold escrow balance per project
- Release payment when approved

### Data Models

```rust
pub struct EscrowRecord {
    pub project_id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub locked: bool,
    pub released: bool,
    pub created_at: u64,
    pub released_at: Option<u64>,
}
```

### Storage Schema
- `escrow:<project_id> -> EscrowRecord`
- `escrow_balance:<project_id> -> i128`
- `escrow_status:<project_id> -> bool`

### Function Signatures
- `lock_funds(project_id, client, freelancer, amount) -> ()`
- `release_funds(project_id) -> ()`
- `refund_client(project_id) -> ()`
- `get_escrow(project_id) -> EscrowRecord`

---

## Contract 3: Receipt Contract

### Responsibility
- Create immutable proof-of-work receipts
- Store completed transaction metadata

### Receipt Fields
- `project_id`
- `client_address`
- `freelancer_address`
- `amount`
- `timestamp`

### Data Models

```rust
pub struct Receipt {
    pub receipt_id: u64,
    pub project_id: u64,
    pub client_address: Address,
    pub freelancer_address: Address,
    pub amount: i128,
    pub timestamp: u64,
    pub tx_hash: Option<BytesN<32>>,
}
```

### Storage Schema
- `receipt_seq: u64`
- `receipt:<receipt_id> -> Receipt`
- `project_receipt:<project_id> -> u64`
- `freelancer_receipts:<freelancer> -> Vec<u64>`

### Function Signatures
- `mint_receipt(project_id, client, freelancer, amount, timestamp) -> u64`
- `get_receipt(receipt_id) -> Receipt`
- `get_receipt_by_project(project_id) -> Receipt`
- `list_receipts_by_freelancer(freelancer) -> Vec<Receipt>`

## Contract Boundary Rules
- Project Registry owns workflow state.
- Escrow owns funds lifecycle.
- Receipt owns immutable record creation.
- The frontend coordinates contract calls in sequence, but the contracts must validate their own state transitions.