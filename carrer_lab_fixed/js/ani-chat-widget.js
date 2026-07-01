// Injects Анюша chat panel into any page + wires up ani-claude.js
// Usage: <script type="module" src="js/ani-chat-widget.js"></script>
import { initAniClaude } from './ani-claude.js';

// ── CSS ──────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  #ani-chat-toggle-btn {
    position: fixed; bottom: 24px; left: 20px; z-index: 10002;
    width: 54px; height: 54px; border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #ec4899);
    border: none; color: #fff; font-size: 1.4rem;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(124,58,237,.5);
    transition: transform .2s, box-shadow .2s;
  }
  #ani-chat-toggle-btn:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(124,58,237,.65); }

  #ani-chat-panel {
    position: fixed; bottom: 90px; left: 20px; z-index: 10001;
    width: 300px; max-height: 420px;
    background: #1e1340;
    border: 1px solid rgba(167,139,250,.3);
    border-radius: 18px;
    box-shadow: 0 20px 60px rgba(0,0,0,.5);
    display: flex; flex-direction: column;
    overflow: hidden;
    transition: opacity .25s, transform .25s;
    font-family: 'Nunito', 'Segoe UI', sans-serif;
  }
  #ani-chat-panel.hidden { opacity: 0; transform: translateY(12px) scale(.97); pointer-events: none; }

  .ani-chat-header {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 14px;
    background: linear-gradient(135deg, #2d1b69, #1e1340);
    border-bottom: 1px solid rgba(167,139,250,.2);
    flex-shrink: 0;
  }
  .ani-chat-header-avatar {
    font-size: 1.4rem; line-height: 1;
  }
  .ani-chat-header-info { flex: 1; }
  .ani-chat-header-name {
    font-size: .88rem; font-weight: 900; color: #fff;
  }
  .ani-chat-header-status {
    font-size: .68rem; color: #34d399; font-weight: 700;
  }
  #ani-chat-close-btn {
    background: rgba(255,255,255,.1); border: none;
    color: rgba(255,255,255,.6); font-size: .85rem;
    width: 26px; height: 26px; border-radius: 50%;
    cursor: pointer; transition: all .2s;
    display: flex; align-items: center; justify-content: center;
  }
  #ani-chat-close-btn:hover { background: rgba(255,255,255,.2); color: #fff; }

  #ani-chat-messages {
    flex: 1; overflow-y: auto; padding: 12px;
    display: flex; flex-direction: column; gap: 8px;
    min-height: 200px;
    scrollbar-width: thin; scrollbar-color: rgba(167,139,250,.3) transparent;
  }
  .ani-msg {
    max-width: 85%; padding: 8px 12px;
    border-radius: 12px; font-size: .82rem;
    font-weight: 700; line-height: 1.45; word-break: break-word;
  }
  .ani-msg.bot {
    background: rgba(124,58,237,.2); border: 1px solid rgba(167,139,250,.2);
    color: #e2d9ff; align-self: flex-start; border-radius: 4px 12px 12px 12px;
  }
  .ani-msg.user {
    background: linear-gradient(135deg, #7c3aed, #ec4899);
    color: #fff; align-self: flex-end; border-radius: 12px 12px 4px 12px;
  }
  .ani-msg.typing {
    background: rgba(255,255,255,.06); color: rgba(255,255,255,.4);
    font-style: italic; font-size: .78rem; align-self: flex-start;
  }

  .ani-chat-input-row {
    display: flex; gap: 6px; padding: 10px 12px;
    border-top: 1px solid rgba(255,255,255,.06);
    flex-shrink: 0;
  }
  #ani-chat-input {
    flex: 1; background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.12); border-radius: 10px;
    padding: 8px 12px; color: #fff; font-family: inherit;
    font-size: .82rem; font-weight: 700; outline: none;
    transition: border-color .2s;
  }
  #ani-chat-input:focus { border-color: rgba(167,139,250,.5); }
  #ani-chat-input::placeholder { color: rgba(255,255,255,.3); font-weight: 600; }
  #ani-chat-send-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #7c3aed, #ec4899);
    border: none; color: #fff; font-size: 1rem;
    cursor: pointer; transition: opacity .2s;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  #ani-chat-send-btn:hover { opacity: .85; }
  #ani-chat-send-btn:disabled { opacity: .35; cursor: not-allowed; }

  @media (max-width: 400px) {
    #ani-chat-panel { left: 8px; right: 8px; width: auto; }
    #ani-chat-btn   { left: 16px; bottom: 80px; }
  }
`;
document.head.appendChild(style);

// ── HTML ─────────────────────────────────────────
const wrap = document.createElement('div');
wrap.innerHTML = `
  <button id="ani-chat-toggle-btn" aria-label="Спросить Анюшу">💬</button>

  <div id="ani-chat-panel" class="hidden">
    <div class="ani-chat-header">
      <span class="ani-chat-header-avatar">🤖</span>
      <div class="ani-chat-header-info">
        <div class="ani-chat-header-name">Анюша</div>
        <div class="ani-chat-header-status">● онлайн</div>
      </div>
      <button id="ani-chat-close-btn" aria-label="Закрыть">✕</button>
    </div>
    <div id="ani-chat-messages"></div>
    <div class="ani-chat-input-row">
      <input id="ani-chat-input" type="text"
        placeholder="Спроси Анюшу..." maxlength="300" autocomplete="off" />
      <button id="ani-chat-send-btn" aria-label="Отправить">➤</button>
    </div>
  </div>
`;
document.body.appendChild(wrap);

// ── Career context from localStorage ─────────────
function getCareerName() {
  const CAREER_NAMES = {
    space:'Космонавт', robot:'Инженер-робототехник', cyber:'Кибербезопасность',
    drone:'Пилот дрона', game:'Геймдизайнер', doctor:'Врач',
    explorer:'Космонавт', builder:'Инженер-робототехник', guardian:'Врач',
    creator:'Геймдизайнер', innovator:'Кибербезопасность'
  };
  try {
    const mp = JSON.parse(localStorage.getItem('kl_my_path') || 'null');
    if (mp?.profile) return CAREER_NAMES[mp.profile] || '';
  } catch {}
  try {
    const cr = JSON.parse(localStorage.getItem('kl_career_result') || 'null');
    if (cr?.name) return cr.name;
    if (cr?.key)  return CAREER_NAMES[cr.key] || '';
  } catch {}
  return '';
}

// ── Init ─────────────────────────────────────────
initAniClaude({ career: getCareerName() });
