// Connects the existing right-side chat UI to Claude API via /api/ani proxy.
// The existing chat widget (from script.js) uses these IDs:
//   chat-toggle, chat-send-btn, chat-text-input, chat-messages,
//   chat-status-text, chat-status-dot, chat-msg-typing

let history = [];
let busy    = false;

function getName()   { try { return localStorage.getItem('kl_name') || 'друг'; }   catch { return 'друг'; } }
function getCareer() {
  const NAMES = { space:'Космонавт', robot:'Инженер-робототехник', cyber:'Кибербезопасность',
    drone:'Пилот дрона', game:'Геймдизайнер', doctor:'Врач',
    explorer:'Космонавт', builder:'Инженер-робототехник', guardian:'Врач',
    creator:'Геймдизайнер', innovator:'Кибербезопасность' };
  try {
    const mp = JSON.parse(localStorage.getItem('kl_my_path') || 'null');
    if (mp?.profile) return NAMES[mp.profile] || '';
  } catch {}
  try {
    const cr = JSON.parse(localStorage.getItem('kl_career_result') || 'null');
    if (cr?.name) return cr.name;
    if (cr?.key)  return NAMES[cr.key] || '';
  } catch {}
  return '';
}

// ── Wait for the existing chat widget to appear in DOM ──
function waitFor(id, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const el = document.getElementById(id);
    if (el) return resolve(el);
    const obs = new MutationObserver(() => {
      const el = document.getElementById(id);
      if (el) { obs.disconnect(); resolve(el); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { obs.disconnect(); reject(new Error(id + ' not found')); }, timeout);
  });
}

// ── Add a message bubble to the existing chat UI ──
function addBubble(text, role) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;

  // Remove typing indicator if present
  document.getElementById('chat-msg-typing')?.remove();

  const wrap = document.createElement('div');
  wrap.className = 'chat-msg ' + (role === 'user' ? 'chat-msg--user' : 'chat-msg--bot');
  wrap.style.cssText = [
    'display:flex', 'align-items:flex-end', 'gap:8px',
    'margin-bottom:10px',
    role === 'user' ? 'flex-direction:row-reverse' : 'flex-direction:row'
  ].join(';');

  const avatar = document.createElement('div');
  avatar.className = 'chat-msg-avatar';
  avatar.style.cssText = 'font-size:1.4rem;flex-shrink:0;line-height:1';
  avatar.textContent = role === 'user' ? '👤' : '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'chat-msg-bubble';
  bubble.style.cssText = [
    'max-width:78%', 'padding:9px 13px', 'border-radius:14px',
    'font-size:.85rem', 'font-weight:700', 'line-height:1.45',
    'word-break:break-word',
    role === 'user'
      ? 'background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;border-radius:14px 14px 4px 14px'
      : 'background:rgba(255,255,255,.1);color:#f1f5f9;border:1px solid rgba(255,255,255,.12);border-radius:4px 14px 14px 14px'
  ].join(';');
  bubble.textContent = text;

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
  return wrap;
}

function showTyping() {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.id = 'chat-msg-typing';
  div.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px';
  div.innerHTML = '<span style="font-size:1.3rem">🤖</span>' +
    '<span style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);' +
    'border-radius:4px 14px 14px 14px;padding:9px 14px;font-size:.82rem;' +
    'color:rgba(255,255,255,.5);font-style:italic">Анюша думает...</span>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── Send message to Claude via /api/ani ──
async function send(text) {
  if (busy || !text) return;
  busy = true;

  addBubble(text, 'user');
  history.push({ role: 'user', content: text });
  showTyping();

  const name   = getName();
  const career = getCareer();

  const system = [
    `Ты — Анюша, дружелюбный AI-наставник по карьере для детей 10–18 лет. Имя ребёнка: ${name}.`,
    'ВАЖНО: отвечай на том языке на котором пишет ребёнок — если пишет по-английски, отвечай по-английски.',
    career ? `Сейчас ребёнок изучает профессию: ${career}. Давай конкретные советы по этой профессии.` : 'Помогай ребёнку найти подходящую профессию.',
    'Если спрашивают "help" или "помоги" — объясни что умеешь: отвечать на вопросы о профессиях, давать советы, объяснять навыки, помогать выбрать путь.',
    'Отвечай конкретно и полезно. Максимум 100 слов. Поощряй любопытство.'
  ].filter(Boolean).join(' ');

  try {
    const res = await fetch('/api/ani', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system,
        messages: history.slice(-20)
      })
    });

    document.getElementById('chat-msg-typing')?.remove();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Ошибка ${res.status}`);
    }

    const data  = await res.json();
    const reply = data.content?.[0]?.text?.trim() || 'Прости, не смогла ответить. Попробуй ещё раз!';
    addBubble(reply, 'bot');
    history.push({ role: 'assistant', content: reply });
    if (history.length > 40) history = history.slice(-40);

  } catch (err) {
    document.getElementById('chat-msg-typing')?.remove();
    addBubble('Ой, что-то пошло не так 😅 Убедись что сервер запущен (npm start).', 'bot');
    console.error('[AniConnect]', err);
  }

  busy = false;
}

// ── Wire up to existing chat widget ──────────────
async function connect() {
  try {
    const sendBtn   = await waitFor('chat-send-btn');
    const textInput = await waitFor('chat-text-input');

    // Override send button — replace with clone to remove old listeners
    const newSend = sendBtn.cloneNode(true);
    sendBtn.replaceWith(newSend);

    newSend.addEventListener('click', () => {
      const txt = textInput.value.trim();
      if (!txt) return;
      textInput.value = '';
      send(txt);
    });

    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const txt = textInput.value.trim();
        if (!txt) return;
        textInput.value = '';
        send(txt);
      }
    });

    // Update status to show AI is connected
    const statusText = document.getElementById('chat-status-text');
    if (statusText) statusText.textContent = 'Анюша · AI готова';

    // ── Build context-aware greeting ──
    function buildGreeting() {
      const name   = getName();
      const career = getCareer();
      const hour   = new Date().getHours();

      // Time of day salutation
      const salute = hour < 5  ? `Не спишь, ${name}? 🌙` :
                     hour < 12 ? `Доброе утро, ${name}! ☀️` :
                     hour < 17 ? `Привет, ${name}! 👋` :
                     hour < 21 ? `Добрый вечер, ${name}! 🌆` :
                                 `Поздно уже, ${name}! 🌙`;

      // Roadmap progress
      let daysComplete = 0;
      try {
        for (let i = 0; i < 7; i++) {
          if (localStorage.getItem(`rm_day${i}_done`) === '1') daysComplete++;
        }
      } catch {}

      // Build message based on journey state
      if (daysComplete >= 7) {
        return `${salute} 🏆 Ты прошёл весь маршрут! Ты настоящий профессионал. Чем могу помочь?`;
      }
      if (daysComplete > 0 && career) {
        return `${salute} Ты на дне ${daysComplete} из 7 в профессии «${career}». Как идёт? Могу помочь с заданиями!`;
      }
      if (career) {
        return `${salute} Ты выбрал профессию «${career}». 🎯 Начни 7-дневный маршрут — или задай мне вопрос!`;
      }
      return `${salute} Я Анюша — твой AI-наставник. Помогу найти профессию мечты. С чего начнём?`;
    }

    // Send greeting on first open
    const toggleBtn = document.getElementById('chat-toggle');
    let greeted = false;
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (!greeted) {
          greeted = true;
          const msg = buildGreeting();
          setTimeout(() => addBubble(msg, 'bot'), 400);
          history.push({ role: 'assistant', content: msg });
        }
      }, { once: false });
    }

    console.log('[AniConnect] ✅ Claude AI connected to existing chat widget');
  } catch (err) {
    console.warn('[AniConnect] Chat widget not found:', err.message);
  }
}

connect();
