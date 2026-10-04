import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { generateJwt } from '@coinbase/cdp-sdk/auth'

function coinbaseApiPlugin() {
  return {
    name: 'coinbase-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/coinbase/accounts', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { keyName, privateKey } = JSON.parse(body || '{}');
            if (!keyName || !privateKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Please provide both your Coinbase Key Name and Private Key' }));
              return;
            }

            let cleanKey = privateKey.trim();
            if (!cleanKey.includes('\n') && cleanKey.includes('\\n')) {
              cleanKey = cleanKey.replace(/\\n/g, '\n');
            }

            // Generate JWT using @coinbase/cdp-sdk/auth which supports Ed25519 and ES256 natively
            const token = await generateJwt({
              apiKeyId: keyName.trim(),
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
              res.statusCode = cbRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Coinbase API error (${cbRes.status}): ${errText}` }));
              return;
            }

            const data = await cbRes.json();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ accounts: data.accounts || [] }));
          } catch (err) {
            console.error('Error in /api/coinbase/accounts handler:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Failed to process Coinbase API request' }));
          }
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), coinbaseApiPlugin()],
  server: {
    proxy: {
      '/api/solana-rpc': {
        target: 'https://api.mainnet-beta.solana.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/solana-rpc/, ''),
        headers: {
          'Origin': ''
        }
      }
    }
  }
})


