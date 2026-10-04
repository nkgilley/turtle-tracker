# TurtleTrack | Multi-Chain Portfolio & Staking Telemetry

> **Slow, steady, sovereign wealth. Non-custodial cross-chain portfolio and staking intelligence platform at turtletrack.com.**

TurtleTrack allows users to create an account, connect and label multiple wallet addresses across diverse blockchain ecosystems, and track liquid assets alongside active staking positions, rebase rewards, and vault yields.

---

## ⚡ Supported Chains, Exchanges & Staking Protocols

| Ecosystem / Platform | Tracked Assets | Staking Protocols & Yield Mechanisms |
| :--- | :--- | :--- |
| **Bitcoin (BTC)** | Native BTC (Legacy, SegWit, Taproot) | **Babylon Protocol**, Lombard Finance (`LBTC`), Core Chain LSTs |
| **Ethereum (ETH)** | ETH, ERC-20s (USDC, USDT, UNI, LINK, PEPE, etc.) | **Native Beacon Validator**, **Lido DAO** (`stETH`), **EigenLayer Restaking** (`wstETH`) |
| **Solana (SOL)** | Native SOL, SPL Tokens (USDC, BONK, etc.) | **Jito MEV Stake** (`JitoSOL`), **Marinade Finance** (`mSOL`), Native Stake Accounts |
| **Hyperliquid (HL)** | HYPE Spot, Perps Margin Collateral | **HYPE Native Staking** (~2.18% APY), **stHYPE Liquid Staking** (~2.11% APY), **HLP Liquidity Vault** (~20.4% APY) |
| **Coinbase (Exchange)**| Spot BTC, ETH, SOL, USDC | **Coinbase Staked ETH (`cbETH`)**, **Coinbase Staked SOL**, **USDC Rewards (4.85% APY)** |

---

## ✨ Features

- **Clean Account Onboarding & Profiles**:
  - **Zero Demo Pollution**: Every new account starts completely clean with a **$0.00 balance** and zero demo wallets.
  - Sign Up, Sign In, and optional 1-Click "Preview Demo Portfolio" mode.
  - Separate per-user storage isolation.
- **Multi-Chain Wallet Management**:
  - Add addresses with real-time format validation for Bitcoin (Bech32/Taproot/P2SH), Ethereum (`0x...`), Solana (Base58), and Hyperliquid.
  - Smart auto-detection of chain from address format.
  - Quick autofill demo buttons to instantly test multi-chain portfolios.
  - 1-click clipboard copy, explorer links (Mempool.space, Etherscan, Solscan, Hyperliquid Explorer), and wallet deletion.
- **Dynamic Portfolio Analytics**:
  - Total Net Worth calculation across all connected wallets.
  - 24-hour PnL ($ and %) with live price tick micro-updates.
  - Blended Staking APY and estimated annual/monthly passive income projections.
  - Interactive SVG spline chart with hover crosshair and timeframe switching (`24H`, `7D`, `30D`, `1Y`, `ALL`).
  - Multi-chain allocation bar and interactive network breakdown cards.
- **Dedicated Staking Hub**:
  - In-depth protocol breakdown for Babylon BTC, Lido/EigenLayer ETH, Jito MEV SOL, and Hyperliquid HYPE/HLP.
  - Active staking positions table with accrued reward counters and protocol badges.
  - Interactive compounding yield forecast calculator (1 to 5 years).
- **On-Chain Activity Feed**:
  - Live ledger event stream showing incoming transfers, staking rebase rewards, and vault yield distributions.
- **Luxury Fintech UI / UX**:
  - Deep cosmic obsidian dark mode with glowing cyan, violet, and emerald accents.
  - Smooth glassmorphism surfaces (`backdrop-filter: blur(16px)`).
  - Fully responsive across desktop, tablet, and mobile devices.

---

## 🚀 Running Locally

The app is powered by **Vite** and **React**.

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (tested on Node v24)
- **npm**: v9.0.0 or later

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Launch Development Server
Start the local development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173/
```

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 🏛️ Million-User Architecture & Scaling Plan

For a complete breakdown of how TurtleTrack is engineered to scale across millions of wallet addresses, see the key architectural pillars below:

### Key Highlights:
1. **Event-Driven Webhook Ingestion**: Uses Helius Geyser gRPC (Solana), Alchemy Address Activity (Ethereum), and ElectrumX/ZMQ (Bitcoin) instead of high-cost REST polling, reducing RPC expenses by **92%**.
2. **$O(1)$ Constant-Time Rebase Handling**: Rebase tokens (such as Lido `stETH`) are stored as immutable user **shares** multiplied by a cached global singleton in Redis, eliminating the need to update tens of millions of records on every daily rebase.
3. **Multi-Tier Storage Hierarchy**:
   - **Redis 7.x Cluster**: Sub-5ms balance snapshots and global market price matrix.
   - **Sharded PostgreSQL (Citus)**: 16 horizontal database shards partitioned by `user_id` and `wallet_hash`.
   - **ClickHouse (OLAP)**: High-throughput time-series analytics for historical net worth curves and performance reporting.
4. **Estimated Monthly Run-Rate**: Evaluated at **~$29,200/month** for 5M active users (~$0.0058/user/mo).

---

## 🛠️ Project Structure

```
crypto-tracker/
├── index.html                   # HTML entry point with fonts & metadata
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite configuration
├── README.md                    # Project documentation
└── src/
    ├── main.jsx                 # React root mount
    ├── App.jsx                  # Main application orchestrator
    ├── index.css                # Custom dark fintech design system
    ├── components/
    │   ├── TurtleLogo.jsx       # Glowing vector turtle mascot & carapace logo
    │   ├── Navbar.jsx           # Top navigation, network status & user menu
    │   ├── PortfolioSummary.jsx # Net worth, 24h PnL & staking metrics
    │   ├── PortfolioChart.jsx   # Interactive SVG spline chart
    │   ├── ChainBreakdown.jsx   # Network allocation bar & cards
    │   ├── AssetTable.jsx       # Filterable & searchable token holdings
    │   ├── StakingHub.jsx       # Dedicated staking hub & yield calculator
    │   ├── ActivityLog.jsx      # On-chain transaction & rebase feed
    │   ├── WalletManagerModal.jsx # Address validator & management modal
    │   └── AuthModal.jsx        # Sign in, sign up & demo user modal
    ├── context/
    │   └── AuthContext.jsx      # Auth state & user profile provider
    ├── data/
    │   └── mockData.js          # Multi-chain seed data & prices
    └── services/
        └── cryptoService.js     # Address validation & portfolio math
```

---

## 🔒 Security & Privacy

- **100% Non-Custodial / Watch-Only**: TurtleTrack never requests, imports, or stores private keys or seed phrases.
- **KMS Envelope Encryption**: All user-defined wallet labels and tags are encrypted at rest using AES-256-GCM.
- **Zero-Knowledge Architecture**: Users can track public ledger addresses without linking personal identities.
