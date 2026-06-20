const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const API_KEY = process.env.ANTHROPIC_API_KEY || '';

// Proxy endpoint — keeps the API key server-side, never exposed to the browser
app.post('/api/ani', async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({
      error: { message: 'API key not configured. Add ANTHROPIC_API_KEY to your .env file.' }
    });
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[Proxy] Error calling Claude API:', err.message);
    res.status(500).json({ error: { message: 'Proxy error: ' + err.message } });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log('');
  console.log('  ================================================');
  console.log('    КарьераЛаб — сервер запущен!');
  console.log('  ================================================');
  console.log('');
  console.log('  Открой в браузере: http://localhost:' + PORT);
  console.log('');
  console.log('  Ani API proxy: ' + (API_KEY ? 'ACTIVE' : 'DISABLED (set ANTHROPIC_API_KEY in .env)'));
  console.log('');
  console.log('  Нажми Ctrl+C чтобы остановить сервер.');
  console.log('');
});
