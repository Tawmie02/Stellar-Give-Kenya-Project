# Escrow Contract

## Responsibilities
- Lock client funds
- Hold escrow balance per project
- Release payment after approval

## Data Models

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

## Storage Schema
- `escrow:<project_id> -> EscrowRecord`
- `escrow_balance:<project_id> -> i128`
- `escrow_status:<project_id> -> bool`

## Function Signatures
- `lock_funds(project_id, client, freelancer, amount) -> ()`
- `release_funds(project_id) -> ()`
- `refund_client(project_id) -> ()`
- `get_escrow(project_id) -> EscrowRecord`

## State Rules
- Funds can be locked only once per project.
- Release is valid only after project completion.
- Release should transfer the exact escrow amount.
- A released escrow cannot be released again.