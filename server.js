import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateJwt } from '@coinbase/cdp-sdk/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json({ limit: '2mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'turtletrack', uptime: process.uptime() });
});

// Coinbase CDP API Endpoint
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TurtleTrack server listening on http://0.0.0.0:${PORT}`);
});
