# Receipt Contract

## Responsibilities
- Create immutable proof-of-work receipts
- Persist the final completion record on chain

## Receipt Fields
- `project_id`
- `client_address`
- `freelancer_address`
- `amount`
- `timestamp`

## Data Models

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

## Storage Schema
- `receipt_seq: u64`
- `receipt:<receipt_id> -> Receipt`
- `project_receipt:<project_id> -> u64`
- `freelancer_receipts:<freelancer> -> Vec<u64>`

## Function Signatures
- `mint_receipt(project_id, client, freelancer, amount, timestamp) -> u64`
- `get_receipt(receipt_id) -> Receipt`
- `get_receipt_by_project(project_id) -> Receipt`
- `list_receipts_by_freelancer(freelancer) -> Vec<Receipt>`

## State Rules
- Exactly one receipt should exist per paid project.
- Receipts are immutable once minted.
- Receipt creation must be triggered only from the approved payment flow.