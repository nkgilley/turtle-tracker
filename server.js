import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateJwt } from '@coinbase/cdp-sdk/auth';
import {
  createUser,
  authenticateUser,
  findOrCreateWalletUser,
  createSession,
  validateSession,
  deleteSession,
  getUserWallets,
  saveUserWallets
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json({ limit: '2mb' }));

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7).trim();
  const user = validateSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'turtletrack', uptime: process.uptime() });
});

// -----------------------------------------------------------------------------
// Authentication Endpoints
// -----------------------------------------------------------------------------

// Sign Up with Email & Password
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Valid email and password (minimum 6 characters) required.' });
    }

    const user = createUser({ email, name, password });
    const { token, expiresAt } = createSession(user.id);
    return res.status(201).json({
      user: { ...user, isDemo: false },
      token,
      expiresAt,
      wallets: []
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Signup failed' });
  }
});

// Log In with Email & Password
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }

    const user = authenticateUser(email, password);
    const { token, expiresAt } = createSession(user.id);
    const wallets = getUserWallets(user.id);

    return res.json({
      user: { ...user, isDemo: false },
      token,
      expiresAt,
      wallets
    });
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Login failed' });
  }
});

// Log In or Register via Web3 Wallet Address
app.post('/api/auth/wallet-login', (req, res) => {
  try {
    const { chain, address, customLabel } = req.body || {};
    if (!chain || !address) {
      return res.status(400).json({ error: 'Chain and wallet address are required.' });
    }

    const user = findOrCreateWalletUser(chain, address, customLabel);
    const { token, expiresAt } = createSession(user.id);
    const wallets = getUserWallets(user.id);

    return res.json({
      user: { ...user, isDemo: false },
      token,
      expiresAt,
      wallets
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Wallet login failed' });
  }
});

// Get Current User Profile & Saved Wallets
app.get('/api/auth/me', authMiddleware, (req, res) => {
  try {
    const wallets = getUserWallets(req.user.id);
    return res.json({
      user: { ...req.user, isDemo: false },
      wallets
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch user profile' });
  }
});

// Log Out
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    deleteSession(token);
  }
  return res.json({ success: true });
});

// -----------------------------------------------------------------------------
// Server-Side Wallets Endpoints
// -----------------------------------------------------------------------------

// Fetch user's saved wallets
app.get('/api/wallets', authMiddleware, (req, res) => {
  try {
    const wallets = getUserWallets(req.user.id);
    return res.json({ wallets });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch wallets' });
  }
});

// Update / Sync user's saved wallets
app.put('/api/wallets', authMiddleware, (req, res) => {
  try {
    const { wallets, confirmClear } = req.body || {};
    if (!Array.isArray(wallets)) {
      return res.status(400).json({ error: 'Wallets must be an array' });
    }

    // Safety guard: if wallets array is empty, ensure it's not an accidental unhydrated sync
    if (wallets.length === 0) {
      const existing = getUserWallets(req.user.id);
      if (existing.length > 0 && !confirmClear) {
        console.warn(`[API] Guard: Prevented accidental clear of ${existing.length} wallets for user ${req.user.id}`);
        return res.json({ success: true, wallets: existing, warning: 'Ignored empty sync to prevent accidental data loss' });
      }
    }

    const updated = saveUserWallets(req.user.id, wallets);
    return res.json({ success: true, wallets: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to save wallets' });
  }
});

// -----------------------------------------------------------------------------
// Coinbase CDP API Endpoint
// -----------------------------------------------------------------------------
app.post('/api/coinbase/accounts', async (req, res) => {
  try {
    const { keyName, privateKey } = req.body || {};
    if (!keyName || !privateKey) {
      return res.status(400).json({ error: 'Please provide both your Coinbase Key Name and Private Key' });
    }

    let cleanKey = privateKey.trim();
    // Normalize escaped newlines from JSON or input fields
    if (!cleanKey.includes('\n') && cleanKey.includes('\\n')) {
      cleanKey = cleanKey.replace(/\\n/g, '\n');
    }
    // Strip surrounding quotes if accidentally pasted from JSON
    if ((cleanKey.startsWith('"') && cleanKey.endsWith('"')) || (cleanKey.startsWith("'") && cleanKey.endsWith("'"))) {
      cleanKey = cleanKey.slice(1, -1);
    }

    let cleanKeyName = keyName.trim();
    // Strip quotes if pasted from JSON
    if ((cleanKeyName.startsWith('"') && cleanKeyName.endsWith('"')) || (cleanKeyName.startsWith("'") && cleanKeyName.endsWith("'"))) {
      cleanKeyName = cleanKeyName.slice(1, -1);
    }

    // Generate JWT using @coinbase/cdp-sdk/auth (handles Ed25519 & ES256)
    const token = await generateJwt({
      apiKeyId: cleanKeyName,
      apiKeySecret: cleanKey,
      requestMethod: 'GET',
      requestHost: 'api.coinbase.com',
      requestPath: '/api/v3/brokerage/accounts'
    });

    // Fetch accounts from Coinbase Advanced Trade / Brokerage
    const cbRes = await fetch('https://api.coinbase.com/api/v3/brokerage/accounts?limit=250', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!cbRes.ok) {
      const errText = await cbRes.text();
      let errorMsg = `Coinbase API error (${cbRes.status})`;
      try {
        const parsed = JSON.parse(errText);
        errorMsg = parsed.message || parsed.error || errorMsg;
      } catch {
        if (errText) errorMsg += `: ${errText}`;
      }
      return res.status(cbRes.status).json({ error: errorMsg });
    }

    const data = await cbRes.json();
    return res.json({ accounts: data.accounts || [] });
  } catch (err) {
    console.error('Error handling Coinbase accounts request:', err);
    return res.status(500).json({ 
      error: err.message || 'Failed to authenticate with Coinbase CDP API' 
    });
  }
});

// Solana RPC Proxy to eliminate browser CORS
app.post('/api/solana-rpc', async (req, res) => {
  try {
    const rpcRes = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await rpcRes.json();
    return res.json(data);
  } catch (err) {
    console.error('Solana RPC Proxy error:', err);
    return res.status(500).json({ error: err.message || 'Solana RPC Proxy Error' });
  }
});

// Serve static assets from Vite build
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// SPA Fallback: send index.html for all other routes
app.use((req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

export { app };

const isDirectRun = process.argv[1] && process.argv[1].endsWith('server.js');
if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`TurtleTrack server listening on port ${PORT}`);
  });
}

