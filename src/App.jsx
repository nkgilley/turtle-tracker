import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PortfolioSummary } from './components/PortfolioSummary';
import { PortfolioChart } from './components/PortfolioChart';
import { ChainBreakdown } from './components/ChainBreakdown';
import { AssetTable } from './components/AssetTable';
import { StakingHub } from './components/StakingHub';
import { ActivityLog } from './components/ActivityLog';
import { WalletManagerModal } from './components/WalletManagerModal';
import { AuthModal } from './components/AuthModal';
import { TurtleLogo } from './components/TurtleLogo';
import { INITIAL_MARKET_PRICES, INITIAL_DEMO_WALLETS, INITIAL_TRANSACTIONS } from './data/mockData';
import { calculatePortfolioMetrics, fetchLiveMarketPrices, fetchLiveWalletAssets } from './services/cryptoService';
import { Shield, Sparkles, Layers, Zap, Plus, ArrowUpRight, Wallet } from 'lucide-react';
import './index.css';

function TrackerMain() {
  const { user, switchToDemo } = useAuth();

  // Scope wallets storage key per user ID to keep new accounts completely fresh
  const getWalletStorageKey = (u) => {
    if (!u) return 'turtletrack_wallets_fresh_guest';
    return u.isDemo ? 'turtletrack_wallets_demo_vip' : `turtletrack_wallets_${u.id}`;
  };

  const getLegacyStorageKey = (u) => {
    if (!u) return 'aura_wallets_fresh_guest';
    return u.isDemo ? 'aura_wallets_demo_vip' : `aura_wallets_${u.id}`;
  };

  // Helper to sanitize and upgrade any stale cached APY values from old sessions
  const sanitizeWalletList = (list) => {
    return (list || []).map(w => ({
      ...w,
      assets: (w.assets || []).map(a => {
        if (a.isStaked) {
          if (a.symbol === 'HYPE' && a.apy > 5) {
            return { ...a, apy: 2.18, rewardsEarned: Number((a.balance * 0.0218 * (30 / 365)).toFixed(2)) };
          }
          if (a.symbol === 'stHYPE' && a.apy > 5) {
            return { ...a, apy: 2.11, rewardsEarned: Number((a.balance * 0.0211 * (30 / 365)).toFixed(2)) };
          }
        }
        return a;
      })
    }));
  };

  // Load wallets: new accounts start with EMPTY array [] and $0 balance
  const [wallets, setWallets] = useState(() => {
    const key = getWalletStorageKey(user);
    const legacyKey = getLegacyStorageKey(user);
    try {
      const saved = localStorage.getItem(key) || localStorage.getItem(legacyKey);
      if (saved) return sanitizeWalletList(JSON.parse(saved));
    } catch {
      // fallback
    }
    // If demo account, load demo wallets; if new account, start with 0
    return user?.isDemo ? INITIAL_DEMO_WALLETS : [];
  });

  const [marketPrices, setMarketPrices] = useState(INITIAL_MARKET_PRICES);
  const [activeTab, setActiveTab] = useState('overview'); // overview, staking, activity
  const [selectedChainFilter, setSelectedChainFilter] = useState('ALL');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [modalInitialChain, setModalInitialChain] = useState('ETH');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Sync wallets when user account switches (e.g. signup, demo switch)
  useEffect(() => {
    const key = getWalletStorageKey(user);
    const legacyKey = getLegacyStorageKey(user);
    try {
      const saved = localStorage.getItem(key) || localStorage.getItem(legacyKey);
      if (saved) {
        setWallets(sanitizeWalletList(JSON.parse(saved)));
        return;
      }
    } catch {}
    setWallets(user?.isDemo ? INITIAL_DEMO_WALLETS : []);
  }, [user?.id, user?.isDemo]);

  // Persist wallets
  useEffect(() => {
    const key = getWalletStorageKey(user);
    try {
      localStorage.setItem(key, JSON.stringify(wallets));
    } catch {}
  }, [wallets, user?.id, user?.isDemo]);

  // Initial live market price fetch from Hyperliquid & co
  useEffect(() => {
    fetchLiveMarketPrices(INITIAL_MARKET_PRICES).then(prices => {
      setMarketPrices(prices);
    });
  }, []);

  // Real-time market tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrices(prev => {
        const next = { ...prev };
        const symbols = Object.keys(next);
        const randomSymbols = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ];

        randomSymbols.forEach(sym => {
          if (next[sym]) {
            const current = next[sym];
            const deltaPercent = (Math.random() * 0.16 - 0.078);
            const newPrice = Number((current.price * (1 + deltaPercent / 100)).toFixed(current.price < 1 ? 6 : 2));
            const newChange = Number((current.change24h + deltaPercent * 0.4).toFixed(2));
            next[sym] = {
              ...current,
              price: newPrice,
              change24h: newChange
            };
          }
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Compute full portfolio metrics
  const metrics = useMemo(() => {
    return calculatePortfolioMetrics(wallets, marketPrices);
  }, [wallets, marketPrices]);

  const handleAddWallet = (newWallet) => {
    setWallets(prev => [newWallet, ...prev]);
    // Log new transaction
    setTransactions(prev => [
      {
        id: `tx-${Date.now()}`,
        type: 'WALLET_SYNC',
        chain: newWallet.chain,
        title: `Added Wallet: ${newWallet.label}`,
        amount: 'Sync Completed',
        timestamp: 'Just now',
        hash: `${newWallet.address.substring(0, 6)}...${newWallet.address.substring(newWallet.address.length - 4)}`,
        status: 'Synced'
      },
      ...prev
    ]);
  };

  const handleDeleteWallet = (walletId) => {
    setWallets(prev => prev.filter(w => w.id !== walletId));
  };

  const handleResetDemo = () => {
    setWallets(INITIAL_DEMO_WALLETS);
    setTransactions(INITIAL_TRANSACTIONS);
    const key = getWalletStorageKey(user);
    try {
      localStorage.setItem(key, JSON.stringify(INITIAL_DEMO_WALLETS));
    } catch {}
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Refresh live market prices
      const updatedPrices = await fetchLiveMarketPrices(marketPrices);
      setMarketPrices(updatedPrices);

      // 2. Re-sync all wallets live on-chain & exchange APIs
      const refreshedWallets = await Promise.all(
        wallets.map(async (w) => {
          try {
            const liveAssets = await fetchLiveWalletAssets(w.chain, w.address, w.privateKey);
            if (liveAssets && liveAssets.length > 0) {
              return { ...w, assets: liveAssets };
            }
          } catch (e) {
            console.warn(`Could not refresh wallet ${w.address}:`, e);
          }
          return w;
        })
      );

      setWallets(refreshedWallets);
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [wallets, marketPrices]);

  const openWalletModal = (initialChain = 'ETH') => {
    setModalInitialChain(initialChain);
    setIsWalletModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        walletsCount={wallets.length}
        onOpenWalletModal={() => openWalletModal('ETH')}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="main-content">
        {/* Portfolio Valuation & Metric Cards */}
        <PortfolioSummary
          metrics={metrics}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Empty State Onboarding Banner when Balance is $0 */}
        {wallets.length === 0 && (
          <div className="empty-portfolio-hero fade-in">
            <div className="empty-hero-content">
              <div className="empty-hero-badge">
                <Sparkles size={15} />
                <span>FRESH ACCOUNT &middot; ZERO DEMO ASSETS</span>
              </div>
              <h2 className="empty-hero-title">Start Tracking Your Multi-Chain Portfolio</h2>
              <p className="empty-hero-desc">
                Your portfolio balance is currently <strong>$0.00</strong>. Connect your self-custody Web3 wallets or link your Coinbase account to begin tracking liquid assets, validator staking, and yields in real time.
              </p>
              <div className="empty-hero-actions">
                <button 
                  className="btn-primary"
                  onClick={() => openWalletModal('ETH')}
                >
                  <Plus size={16} />
                  <span>Add Web3 Wallet (BTC, ETH, SOL, HL)</span>
                </button>
                <button 
                  className="btn-secondary coinbase-action-btn"
                  onClick={() => openWalletModal('COINBASE')}
                >
                  <span className="coinbase-dot">🔵</span>
                  <span>Connect Coinbase Account</span>
                </button>
                <button 
                  className="btn-accent"
                  onClick={() => switchToDemo()}
                >
                  <Sparkles size={15} />
                  <span>Preview Demo Portfolio</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="tab-pane fade-in">
            {/* Chart & Network Allocation Row */}
            <div className="dashboard-grid-row">
              <div className="grid-col-chart">
                <PortfolioChart totalNetWorth={metrics.totalNetWorth} />
              </div>
              <div className="grid-col-allocation">
                <ChainBreakdown
                  chainTotals={metrics.chainTotals}
                  totalNetWorth={metrics.totalNetWorth}
                  onSelectChainFilter={setSelectedChainFilter}
                  selectedChainFilter={selectedChainFilter}
                />
              </div>
            </div>

            {/* Asset Table */}
            <AssetTable
              assets={metrics.flattenedAssets}
              activeChainFilter={selectedChainFilter}
              onSelectChainFilter={setSelectedChainFilter}
            />
          </div>
        )}

        {/* Tab 2: Staking Hub */}
        {activeTab === 'staking' && (
          <div className="tab-pane fade-in">
            <StakingHub
              stakingPositions={metrics.stakingPositions}
              totalStakedValue={metrics.totalStakedValue}
              totalAnnualYield={metrics.totalAnnualYield}
              averageStakingApy={metrics.averageStakingApy}
            />
          </div>
        )}

        {/* Tab 3: Activity Feed */}
        {activeTab === 'activity' && (
          <div className="tab-pane fade-in">
            <ActivityLog transactions={transactions} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">
              <TurtleLogo size={22} />
              <span>TURTLETRACK.COM</span>
            </div>
            <p className="footer-desc">
              Slow, steady, sovereign wealth. Non-custodial multi-chain portfolio and staking telemetry for Bitcoin, Ethereum, Solana, Hyperliquid, and Coinbase.
            </p>
          </div>
          <div className="footer-right">
            <div className="footer-pill">
              <span className="pulse-dot green"></span>
              <span>All Reef Indexers Nominal</span>
            </div>
            <span className="footer-copy">&copy; {new Date().getFullYear()} TurtleTrack.com. Built for Million-User Scale.</span>
          </div>
        </div>
      </footer>

      {/* Wallet & Exchange Management Modal */}
      <WalletManagerModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallets={wallets}
        onAddWallet={handleAddWallet}
        onDeleteWallet={handleDeleteWallet}
        onResetDemo={handleResetDemo}
        initialChain={modalInitialChain}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TrackerMain />
    </AuthProvider>
  );
}
