# SkillReceipt: Decentralized Freelance Escrow on Stellar

SkillReceipt is a decentralized freelance escrow platform built on the **Stellar Testnet** using **Soroban smart contracts**. It allows clients to secure funds in escrow, enables freelancers to deliver work, and mints an immutable on-chain **SkillReceipt** (NFT-like achievement receipt) once payment is released.

---

## 🚀 MVP Scope & Key Features

* **Freighter Wallet Connection**: Secure and easy authentication for users.
* **Project Marketplace**: Browse active listings or post new projects.
* **Freelancer Applications**: Apply for jobs with relevant proposals.
* **On-Chain Escrow**: Payments are safely locked in a smart contract and released only when work is completed.
* **Immutable Receipt Generation**: Automatic minting of a "SkillReceipt" verification token upon successful project payout.
* **Role-Based Dashboards**: Tailored views and controls for both **Clients** and **Freelancers**.

---

## 🏛️ Smart Contract Addresses (Stellar Testnet)

These contracts are deployed on the Stellar Testnet:

* **Receipt Contract ID**: `CD4D77ZIU6XLWGXXEO3VSJFRMH5PVUUNKGOEWOYGK5MRE2FLTTYXFS4R`
* **Project Registry Contract ID**: `CBLXTGAFNZ4W3FP534NJJPJLYSIBXELIUCBBJZGMG3R4WCWCH23AXIDJ`
* **Escrow Contract ID**: `CCNGA3N7IBBKI6S5RL2CAPJ4EE5DSEZ3AK4UGZALCEQY3HWRM4I67LYL`

---

## 📂 Repository Structure

The project is organized inside the `skillreceipt/` directory:

```text
Stellar-Give-Kenya-Project/
├── skillreceipt/
│   ├── contracts/             # Soroban Smart Contracts (Rust)
│   │   ├── escrow/            # Escrow contract workspace
│   │   ├── project-registry/  # Project registration and bidding contract
│   │   └── receipt/           # SkillReceipt minting logic
│   ├── frontend/              # Web application (React, TypeScript, Vite, TailwindCSS)
│   │   ├── src/               # React components, pages, context, and custom hooks
│   │   └── tailwind.config.ts # Tailwind CSS configuration
│   ├── docs/                  # Architecture, smart contract specifications, and design systems
│   └── README.md              # Folder level documentation overview
└── README.md                  # Consolidated Project README (This file)
```

---

## 🛠️ Local Development Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [Rust & Cargo](https://www.rust-lang.org/) (with `wasm32-unknown-unknown` target installed)
* [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli)
* [Freighter Wallet Chrome Extension](https://www.freighter.app/) configured to use the Stellar Testnet.

---

### 💻 Running the Frontend

1. Navigate to the frontend folder:
   ```bash
   cd skillreceipt/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173` (or the URL printed in your console).

---

### 🦀 Building & Testing Soroban Smart Contracts

Each contract workspace (`escrow`, `project-registry`, `receipt`) can be built and tested independently using standard Rust commands:

1. Navigate to a contract folder (e.g., `escrow`):
   ```bash
   cd skillreceipt/contracts/escrow
   ```
2. Run automated tests:
   ```bash
   cargo test
   ```
3. Build the contract to WASM:
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```

---

## 🎨 Visual and UI System
The frontend has been developed in line with a high-trust, minimalist, and professional design theme:
* **Color Palette**: Clean light-mode design utilizing crisp white backgrounds, subtle zinc/slate surfaces, and high-contrast typography.
* **Typography**: Styled using modern, readable sans-serif typefaces (e.g., Inter or system defaults).
* **Grid & Layout**: Unified 8px spacing system with generous card padding and a clean sidebar navigation setup.
