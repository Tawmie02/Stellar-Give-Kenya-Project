# Frontend Scaffold

This folder contains the React + Vite frontend for SkillReceipt.

## Visual Direction
- High-trust, minimalist, and professional.
- Clean light mode with white backgrounds and subtle zinc/slate surfaces.
- Inter or a similar clean sans-serif type family.
- Strict 8-point spacing rhythm with generous card padding.

## Built Pages
- Landing Page with hero background image slot
- Role-based Dashboard
- Create Project
- Project Marketplace
- Project Details
- Receipts

## Built Components
- Navbar
- Sidebar
- WalletConnectButton
- ProjectCard
- ApplicationCard
- ReceiptCard
- StatusBadge
- ProjectForm

## Routing Plan
- `/`
- `/dashboard`
- `/projects/new`
- `/projects`
- `/projects/:id`
- `/receipts`

## Suggested State Ownership
- Wallet state: connection status, address, role
- Project state: list, selected project, applications
- Receipt state: receipt history and detail view

## Suggested Services
- Freighter connector
- Contract invoker for registry, escrow, and receipt calls
- Read-only contract query helpers

## Implementation Notes
- Keep the UI responsive and minimal.
- Use route guards only where necessary.
- Build the happy path first for the demo.
- Read contract state after every successful write.