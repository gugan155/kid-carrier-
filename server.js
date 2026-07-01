// КарьераЛаб — local dev server
// Serves ./carrer_lab_fixed/ as static files + proxies /api/ani → Claude API
//
// Usage:
//   1. Create .env file with ANTHROPIC_API_KEY=sk-ant-...
//   2. npm install
//   3. npm start
//   4. Open http://localhost:3000

require('dotenv').config();
const express = require('express');
const https   = require('https');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

// ── Static files ──────────────────────────────────
app.use(express.static(path.join(__dirname, 'carrer_lab_fixed')));

// ── /api/ani → Anthropic Claude proxy ─────────────
app.post('/api/ani', (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('[/api/ani] ANTHROPIC_API_KEY not set — create a .env file');
    return res.status(500).json({
      error: { message: 'API key not configured. Add ANTHROPIC_API_KEY to your .env file.' }
    });
  }

  const body = JSON.stringify(req.body);

  const options = {
    hostname: 'api.anthropic.com',
    path:     '/v1/messages',
    method:   'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length':    Buffer.byteLength(body)
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => { data += chunk; });
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode);
      try {
        res.json(JSON.parse(data));
      } catch {
        res.send(data);
      }
    });
  });

  proxyReq.on('error', (err) => {
    console.error('[/api/ani] Proxy error:', err.message);
    res.status(500).json({ error: { message: err.message } });
  });

  proxyReq.write(body);
  proxyReq.end();
});

// ── Fallback — SPA ────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'carrer_lab_fixed', 'index.html'));
});

// ── Start ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║   🚀  КарьераЛаб — сервер запущен!        ║');
  console.log(`  ║   Открой:  http://localhost:${PORT}            ║`);
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log('');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('  ⚠️  ANTHROPIC_API_KEY не найден.');
    console.warn('     Создай файл .env и добавь:');
    console.warn('     ANTHROPIC_API_KEY=sk-ant-...');
    console.warn('     Анюша работать не будет пока не добавишь ключ.');
    console.warn('');
  } else {
    console.log('  ✅  Анюша готова к работе!');
    console.log('');
  }
});
