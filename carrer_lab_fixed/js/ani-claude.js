let history = [], careerCtx = "", userName = "друг";
let busy = false, messagesEl = null, inputEl = null, sendBtn = null, panelEl = null;

export function initAniClaude(opts = {}) {
  careerCtx = opts.career || "";
  try { userName = localStorage.getItem("kl_name") || "друг"; } catch {}
  messagesEl = document.getElementById("ani-chat-messages");
  inputEl    = document.getElementById("ani-chat-input");
  sendBtn    = document.getElementById("ani-chat-send-btn");
  panelEl    = document.getElementById("ani-chat-panel");
  const toggleBtn = document.getElementById("ani-chat-toggle-btn");
  const closeBtn  = document.getElementById("ani-chat-close-btn");
  toggleBtn?.addEventListener("click", openPanel);
  closeBtn?.addEventListener("click", closePanel);
  panelEl?.addEventListener("click", e => { if (e.target === panelEl) closePanel(); });
  inputEl?.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });
  sendBtn?.addEventListener("click", send);
}

function openPanel() {
  panelEl?.classList.remove("hidden");
  inputEl?.focus();
  if (history.length === 0) {
    const greeting = `Привет, ${userName}! 😊 Я Анюша — твой наставник. Сейчас ты изучаешь ${careerCtx ? `профессию "${careerCtx}"` : "профессии"}. Задай мне любой вопрос!`;
    addMsg(greeting, "bot");
    history.push({ role: "assistant", content: greeting });
  }
}

function closePanel() { panelEl?.classList.add("hidden"); }

function addMsg(text, side) {
  if (!messagesEl) return;
  const div = document.createElement("div");
  div.className = `ani-msg ${side}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function showTyping() {
  if (!messagesEl) return;
  const div = document.createElement("div");
  div.className = "ani-msg typing";
  div.id = "ani-typing";
  div.textContent = "Анюша думает...";
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() { document.getElementById("ani-typing")?.remove(); }

async function send() {
  if (!inputEl || busy) return;
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = "";
  addMsg(text, "user");
  history.push({ role: "user", content: text });
  busy = true;
  if (sendBtn) sendBtn.disabled = true;
  showTyping();
  try {
    const system = [
      `Ты — Анюша, дружелюбный AI-наставник по карьере для детей 10–18 лет. Имя ребёнка: ${userName}.`,
      "ВАЖНО: отвечай на том языке на котором пишет ребёнок. Если пишет по-английски — отвечай по-английски. Если по-русски — по-русски.",
      careerCtx ? `Сейчас ребёнок изучает профессию: ${careerCtx}. Давай конкретные советы именно по этой профессии.` : "Помогай ребёнку найти подходящую профессию.",
      "Отвечай конкретно и по делу. Максимум 100 слов. Не повторяй одно и то же.",
      "Если спрашивают 'help' или 'помоги' — перечисли что ты умеешь: отвечать на вопросы о профессиях, давать советы по обучению, объяснять навыки, помогать выбрать путь.",
      "Если вопрос про профессию — объясни простыми словами: что делает специалист, какие навыки нужны, с чего начать прямо сейчас.",
      "Поощряй любопытство. Будь тёплым и мотивирующим наставником."
    ].filter(Boolean).join(" ");

    // Calls local proxy — API key stays on the server, never in the browser
    const res = await fetch("/api/ani", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system,
        messages: history.filter(m => m.role !== "system").slice(-40)
      })
    });
    hideTyping();
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Ошибка ${res.status}`);
    }
    const data = await res.json();
    const reply = data.content?.[0]?.text?.trim() || "Прости, не смогла ответить. Попробуй ещё раз!";
    addMsg(reply, "bot");
    history.push({ role: "assistant", content: reply });
    if (history.length > 40) history = history.slice(-40);
  } catch (err) {
    hideTyping();
    console.error("[AniClaude]", err);
    addMsg("Ой, что-то пошло не так 😅 Проверь соединение и попробуй ещё раз!", "bot");
  } finally {
    busy = false;
    if (sendBtn) sendBtn.disabled = false;
    inputEl?.focus();
  }
}
