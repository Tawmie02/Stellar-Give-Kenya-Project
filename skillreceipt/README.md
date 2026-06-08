# SkillReceipt

SkillReceipt is a hackathon-ready decentralized freelance escrow platform on Stellar Testnet using Soroban smart contracts. Clients fund work in escrow, freelancers apply and deliver work, and the platform mints an immutable on-chain SkillReceipt when payment is released.

## MVP Scope
- Freighter wallet connection
- Project creation and marketplace browsing
- Freelancer applications and selection
- Escrow locking and payment release
- Receipt generation
- Role-based dashboards for client and freelancer

## Tech Stack
- Stellar Testnet
- Soroban
- Rust
- React
- TypeScript
- Vite
- TailwindCSS
- Freighter
- Zustand or React Context

## Repository Layout
- `contracts/` Soroban contract specs and Rust scaffolding notes
- `frontend/` React application blueprint
- `docs/` architecture, design, and implementation docs
- `scripts/` deployment and demo automation notes
- `.github/` labels and milestone setup

## Local Setup
1. Clone the repository.
2. Install the frontend dependencies-npm,freighter
3. Configure Freighter on Stellar Testnet.
4. Build and deploy the Soroban contracts to testnet.
5. Run the Vite frontend and connect the wallet.

## Deployment Model
- Contracts deploy to Stellar Testnet
- Frontend can be hosted on Vercel, Netlify, or GitHub Pages
- Contract addresses are injected through environment variables

For the full implementation blueprint, see the docs in `docs/`.