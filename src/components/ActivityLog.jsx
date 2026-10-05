import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ShieldCheck, Flame, Clock, Layers } from 'lucide-react';
import { SUPPORTED_CHAINS } from '../data/mockData';

export function ActivityLog({ transactions }) {
  const getIconForType = (type) => {
    switch (type) {
      case 'STAKE_REWARD':
        return <ShieldCheck size={16} className="purple-text" />;
      case 'TRANSFER_IN':
        return <ArrowDownLeft size={16} className="green-text" />;
      case 'STAKE_LOCK':
        return <Flame size={16} className="cyan-text" />;
      default:
        return <ArrowUpRight size={16} />;
    }
  };

  const getChainColor = (chain) => {
    const c = SUPPORTED_CHAINS.find(item => item.id === chain);
    return c ? c.color : '#00F0FF';
  };

  return (
    <div className="activity-container">
      <div className="activity-header">
        <div>
          <h3 className="card-heading">On-Chain Activity &amp; Staking Yield Rebase Feed</h3>
          <p className="activity-sub">Verified ledger events across indexed multi-chain wallets</p>
        </div>
        <span className="live-pill">
          <span className="pulse-dot green"></span>
          Live Indexer Active
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-activity-card">
          <Layers size={36} className="empty-icon" />
          <p>No on-chain activity or rebase rewards logged yet.</p>
          <span>Transactions and staking events will appear here as your wallets sync with public indexers.</span>
        </div>
      ) : (
        <div className="activity-list">
          {transactions.map(tx => {
            const color = getChainColor(tx.chain);
            return (
              <div key={tx.id} className="activity-item">
                <div className="activity-left">
                  <div className="activity-icon-box" style={{ borderColor: `${color}30` }}>
                    {getIconForType(tx.type)}
                  </div>
                  <div className="activity-meta">
                    <div className="activity-title-row">
                      <span className="activity-title">{tx.title}</span>
                      <span className="chain-mini-badge" style={{ color: color, borderColor: `${color}40` }}>
                        {tx.chain}
                      </span>
                    </div>
                    <div className="activity-sub-row">
                      <span className="activity-time">
                        <Clock size={12} />
                        {tx.timestamp}
                      </span>
                      <span className="tx-hash font-mono">Tx: {tx.hash}</span>
                    </div>
                  </div>
                </div>

                <div className="activity-right">
                  <span className="activity-amount font-mono">{tx.amount}</span>
                  <span className="activity-status-pill">{tx.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
