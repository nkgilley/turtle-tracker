// Initial sample market prices and supported chains
export const SUPPORTED_CHAINS = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', color: '#b45309', icon: '₿', explorer: 'https://mempool.space/address/' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', color: '#4338ca', icon: 'Ξ', explorer: 'https://etherscan.io/address/' },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', color: '#047857', icon: '◎', explorer: 'https://solscan.io/account/' },
  { id: 'HL', name: 'Hyperliquid', symbol: 'HYPE', color: '#0f766e', icon: '⚡', explorer: 'https://app.hyperliquid.xyz/explorer/address/' },
  { id: 'COINBASE', name: 'Coinbase', symbol: 'COIN', color: '#1d4ed8', icon: '🔵', explorer: 'https://coinbase.com' },
];

export const INITIAL_MARKET_PRICES = {
  BTC: { price: 85250.00, change24h: 1.85, name: 'Bitcoin', symbol: 'BTC', chain: 'BTC' },
  ETH: { price: 2699.00, change24h: 2.15, name: 'Ethereum', symbol: 'ETH', chain: 'ETH' },
  SOL: { price: 121.50, change24h: 3.64, name: 'Solana', symbol: 'SOL', chain: 'SOL' },
  HYPE: { price: 89.85, change24h: 6.92, name: 'Hyperliquid', symbol: 'HYPE', chain: 'HL' },
  stHYPE: { price: 89.90, change24h: 6.95, name: 'Liquid Staked HYPE', symbol: 'stHYPE', chain: 'HL' },
  cbETH: { price: 2985.40, change24h: 2.18, name: 'Coinbase Wrapped Staked ETH', symbol: 'cbETH', chain: 'COINBASE' },
  cbBTC: { price: 85250.00, change24h: 1.85, name: 'Coinbase Wrapped BTC', symbol: 'cbBTC', chain: 'COINBASE' },
  stETH: { price: 2701.20, change24h: 2.16, name: 'Lido Staked ETH', symbol: 'stETH', chain: 'ETH' },
  wstETH: { price: 3180.10, change24h: 2.20, name: 'Wrapped stETH', symbol: 'wstETH', chain: 'ETH' },
  JitoSOL: { price: 158.44, change24h: 3.82, name: 'Jito Staked SOL', symbol: 'JitoSOL', chain: 'SOL' },
  mSOL: { price: 170.83, change24h: 3.75, name: 'Marinade Staked SOL', symbol: 'mSOL', chain: 'SOL' },
  LBTC: { price: 85200.00, change24h: 1.82, name: 'Lombard Staked BTC', symbol: 'LBTC', chain: 'BTC' },
  USDC: { price: 1.00, change24h: 0.01, name: 'USD Coin', symbol: 'USDC', chain: 'ETH' },
  USDT: { price: 1.00, change24h: -0.01, name: 'Tether USD', symbol: 'USDT', chain: 'ETH' },
  LINK: { price: 14.15, change24h: -0.80, name: 'Chainlink', symbol: 'LINK', chain: 'ETH' },
  UNI: { price: 9.05, change24h: 2.10, name: 'Uniswap', symbol: 'UNI', chain: 'ETH' },
  HLP: { price: 1.142, change24h: 0.35, name: 'Hyperliquidity Provider Vault', symbol: 'HLP', chain: 'HL' },
  BONK: { price: 0.0000215, change24h: 4.4, name: 'Bonk', symbol: 'BONK', chain: 'SOL' },
  MAX: { price: 0.0000018, change24h: 5.2, name: 'Max Token', symbol: 'MAX', chain: 'HL' },
  LATINA: { price: 0.0012, change24h: -1.4, name: 'Latina', symbol: 'LATINA', chain: 'HL' },
  NXM: { price: 68.20, change24h: 0.50, name: 'Nexus Mutual', symbol: 'NXM', chain: 'ETH' }
};

export const INITIAL_DEMO_WALLETS = [
  {
    id: 'w-eth-user',
    label: 'Ethereum & Validator Stake',
    chain: 'ETH',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    color: '#627EEA',
    createdAt: '2024-01-10',
    isPrimary: true,
    assets: [
      { symbol: 'ETH', balance: 0.7038, isStaked: false },
      { symbol: 'ETH', balance: 32.00, isStaked: true, protocol: 'Native Beacon Validator', apy: 3.4, rewardsEarned: 1.15 },
      { symbol: 'NXM', balance: 0.0656, isStaked: false },
      { symbol: 'USDT', balance: 0.98, isStaked: false }
    ]
  },
  {
    id: 'w-sol-user',
    label: 'Solana & JitoSOL MEV',
    chain: 'SOL',
    address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
    color: '#14F195',
    createdAt: '2024-02-15',
    isPrimary: true,
    assets: [
      { symbol: 'SOL', balance: 0.4627, isStaked: false },
      { symbol: 'JitoSOL', balance: 399.146, isStaked: true, protocol: 'Jito MEV Stake', apy: 7.9, rewardsEarned: 4.12 }
    ]
  },
  {
    id: 'w-hl-user',
    label: 'Hyperliquid & HYPE Staking',
    chain: 'HL',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    color: '#20E5A3',
    createdAt: '2024-03-01',
    isPrimary: false,
    assets: [
      { symbol: 'HYPE', balance: 491.97, isStaked: false },
      { symbol: 'HYPE', balance: 1038.01, isStaked: true, protocol: 'Hyperliquid Native Staking', apy: 2.20, rewardsEarned: 12.45 },
      { symbol: 'stHYPE', balance: 905.635, isStaked: true, protocol: 'stHYPE Liquid Staking', apy: 2.14, rewardsEarned: 10.85 },
      { symbol: 'USDC', balance: 1.00, isStaked: false }
    ]
  },
  {
    id: 'w-btc-1',
    label: 'Cold Storage Vault',
    chain: 'BTC',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    color: '#F7931A',
    createdAt: '2024-01-15',
    isPrimary: false,
    assets: [
      { symbol: 'BTC', balance: 2.45, isStaked: false },
      { symbol: 'LBTC', balance: 0.85, isStaked: true, protocol: 'Babylon / Lombard', apy: 4.8, rewardsEarned: 0.018 }
    ]
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'STAKE_REWARD',
    chain: 'ETH',
    title: 'Beacon Chain Validator Consensus Reward',
    amount: '+ 0.021 ETH',
    timestamp: '2 hours ago',
    hash: '0xf4a1...c995',
    status: 'Completed'
  },
  {
    id: 'tx-2',
    type: 'STAKE_REWARD',
    chain: 'SOL',
    title: 'Jito MEV Staking Epoch Reward',
    amount: '+ 0.084 JitoSOL',
    timestamp: '5 hours ago',
    hash: '3YzU...LQiB',
    status: 'Completed'
  },
  {
    id: 'tx-3',
    type: 'STAKE_REWARD',
    chain: 'HL',
    title: 'Hyperliquid Native L1 Staking Payout',
    amount: '+ 0.41 HYPE',
    timestamp: '9 hours ago',
    hash: '0xd8da...045',
    status: 'Completed'
  },
  {
    id: 'tx-4',
    type: 'TRANSFER_IN',
    chain: 'BTC',
    title: 'Bitcoin Received to Cold Vault',
    amount: '+ 0.25 BTC',
    timestamp: '1 day ago',
    hash: '9a4c...18f3',
    status: 'Completed'
  }
];
