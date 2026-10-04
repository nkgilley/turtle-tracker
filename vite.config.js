import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createPrivateKey, createSign, randomBytes } from 'crypto'

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

            // Support either SEC1 (BEGIN EC PRIVATE KEY) or PKCS#8 (BEGIN PRIVATE KEY)
            const keyObj = createPrivateKey(cleanKey);

            let allAccounts = [];
            let hasNext = true;
            let cursor = '';

            // Fetch up to 3 pages (up to 750 accounts)
            let pageCount = 0;
            while (hasNext && pageCount < 3) {
              pageCount++;
              const now = Math.floor(Date.now() / 1000);
              const path = cursor
                ? `/api/v3/brokerage/accounts?limit=250&cursor=${encodeURIComponent(cursor)}`
                : `/api/v3/brokerage/accounts?limit=250`;

              const header = {
                alg: 'ES256',
                typ: 'JWT',
                kid: keyName.trim(),
                nonce: randomBytes(16).toString('hex')
              };
              const payload = {
                iss: 'cdp',
                nbf: now,
                exp: now + 120,
                sub: keyName.trim(),
                uri: `GET api.coinbase.com${path}`
              };

              const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
              const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
              const sign = createSign('SHA256');
              sign.update(`${b64Header}.${b64Payload}`);
              sign.end();
              const signature = sign.sign({ key: keyObj, dsaEncoding: 'ieee-p1363' });
              const token = `${b64Header}.${b64Payload}.${signature.toString('base64url')}`;

              const cbRes = await fetch(`https://api.coinbase.com${path}`, {
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
              if (Array.isArray(data.accounts)) {
                allAccounts.push(...data.accounts);
              }

              hasNext = !!data.has_next && !!data.cursor;
              cursor = data.cursor || '';
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ accounts: allAccounts }));
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


