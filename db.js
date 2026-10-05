import { DatabaseSync } from 'node:sqlite';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'turtletrack.db');
console.log(`[Database] Initializing SQLite at ${DB_PATH}`);

const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high concurrency & reliability
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  console.warn('[Database] WAL PRAGMA error (ignoring):', e.message);
}

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT,
    salt TEXT,
    provider TEXT DEFAULT 'email',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    chain TEXT NOT NULL,
    address TEXT NOT NULL,
    label TEXT,
    color TEXT,
    is_primary INTEGER DEFAULT 0,
    assets_json TEXT DEFAULT '[]',
    raw_data TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
`);

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

export function createUser({ email, name, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const id = `usr-${crypto.randomBytes(8).toString('hex')}`;
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  db.prepare(`
    INSERT INTO users (id, email, name, password_hash, salt, provider)
    VALUES (?, ?, ?, ?, ?, 'email')
  `).run(id, cleanEmail, name || cleanEmail.split('@')[0], passwordHash, salt);

  return { id, email: cleanEmail, name: name || cleanEmail.split('@')[0] };
}

export function authenticateUser(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
  if (!user || !user.password_hash || !user.salt) {
    throw new Error('Invalid email or password.');
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.password_hash) {
    throw new Error('Invalid email or password.');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider
  };
}

export function findOrCreateWalletUser(chain, address, customLabel) {
  const cleanAddr = address.trim();
  const normalizedAddr = cleanAddr.toLowerCase();
  const targetChain = chain.toUpperCase();
  const id = `usr-w3-${targetChain.toLowerCase()}-${normalizedAddr}`;
  const shortAddr = cleanAddr.length > 10 
    ? `${cleanAddr.slice(0, 6)}...${cleanAddr.slice(-4)}` 
    : cleanAddr;
  const canonicalEmail = `${normalizedAddr}@${targetChain.toLowerCase()}.wallet`;
  const legacyVirtualEmail = `${shortAddr.replace(/\.\.\./g, '_')}@${targetChain.toLowerCase()}.wallet`.toLowerCase();

  // Find user by deterministic ID or email
  let user = db.prepare('SELECT * FROM users WHERE id = ? OR email = ? OR email = ?').get(id, canonicalEmail, legacyVirtualEmail);
  if (!user) {
    db.prepare(`
      INSERT INTO users (id, email, name, provider)
      VALUES (?, ?, ?, 'wallet')
    `).run(id, canonicalEmail, customLabel || shortAddr);
    user = { id, email: canonicalEmail, name: customLabel || shortAddr, provider: 'wallet' };

    // Seed initial default chain wallet for this address
    const dateStr = new Date().toISOString().split('T')[0];
    const isEth = targetChain === 'ETH';
    if (isEth) {
      saveUserWallets(id, [
        {
          id: `w-eth-${normalizedAddr}`,
          label: 'Ethereum & L2 Ecosystem',
          chain: 'ETH',
          address: cleanAddr,
          color: '#627EEA',
          createdAt: dateStr,
          isPrimary: true,
          assets: []
        },
        {
          id: `w-hl-${normalizedAddr}`,
          label: 'Hyperliquid L1 & EVM',
          chain: 'HL',
          address: cleanAddr,
          color: '#20E5A3',
          createdAt: dateStr,
          isPrimary: false,
          assets: []
        }
      ]);
    } else {
      saveUserWallets(id, [
        {
          id: `w-sol-${normalizedAddr}`,
          label: 'Solana Web3 Account',
          chain: 'SOL',
          address: cleanAddr,
          color: '#14F195',
          createdAt: dateStr,
          isPrimary: true,
          assets: []
        }
      ]);
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    provider: 'wallet',
    walletChain: targetChain,
    walletAddress: cleanAddr
  };
}

export function createSession(userId) {
  const token = `ttk_${crypto.randomBytes(32).toString('hex')}`;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const expiresAt = Date.now() + thirtyDaysMs;

  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(token, userId, expiresAt);

  return { token, expiresAt };
}

export function validateSession(token) {
  if (!token) return null;
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!session) return null;

  if (Date.now() > session.expires_at) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  const user = db.prepare('SELECT id, email, name, provider FROM users WHERE id = ?').get(session.user_id);
  if (!user) return null;

  if (user.provider === 'wallet' && user.id.startsWith('usr-w3-')) {
    const parts = user.id.split('-');
    const walletChain = parts[2]?.toUpperCase();
    const walletAddress = parts.slice(3).join('-');
    return {
      ...user,
      walletChain,
      walletAddress
    };
  }

  return user;
}

export function deleteSession(token) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function getUserWallets(userId) {
  const rows = db.prepare(`
    SELECT * FROM wallets WHERE user_id = ? ORDER BY is_primary DESC, created_at ASC
  `).all(userId);

  return rows.map(r => {
    let assets = [];
    let raw = {};
    try { assets = JSON.parse(r.assets_json || '[]'); } catch {}
    try { raw = JSON.parse(r.raw_data || '{}'); } catch {}

    return {
      id: r.id,
      label: r.label,
      chain: r.chain,
      address: r.address,
      color: r.color,
      isPrimary: !!r.is_primary,
      createdAt: r.created_at,
      assets,
      ...raw
    };
  });
}

export function saveUserWallets(userId, walletList) {
  if (!userId || !Array.isArray(walletList)) return [];

  // Begin transaction
  db.exec('BEGIN TRANSACTION;');
  try {
    // Delete existing wallets for user
    db.prepare('DELETE FROM wallets WHERE user_id = ?').run(userId);

    const insertStmt = db.prepare(`
      INSERT INTO wallets (id, user_id, chain, address, label, color, is_primary, assets_json, raw_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    for (const w of walletList) {
      if (!w || !w.address) continue;
      const walletId = w.id || `w-${w.chain?.toLowerCase() || 'custom'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const assetsJson = JSON.stringify(w.assets || []);
      const { id: _id, label, chain, address, color, isPrimary, assets: _assets, createdAt, ...rest } = w;
      const rawJson = JSON.stringify(rest || {});
      const cAt = createdAt || new Date().toISOString().split('T')[0];

      insertStmt.run(
        walletId,
        userId,
        chain || 'ETH',
        address,
        label || address,
        color || '#20E5A3',
        isPrimary ? 1 : 0,
        assetsJson,
        rawJson,
        cAt
      );
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  return getUserWallets(userId);
}
