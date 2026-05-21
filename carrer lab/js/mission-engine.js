/**
 * Phase 5.3 — Real-World Career Mission Engine
 * JSON-driven daily/weekly mission cards with XP/badge integration.
 *
 * Exports: initMissionEngine, renderMissionCards
 * Storage: kl_missions_done (localStorage, namespaced)
 * Safe: no global pollution, additive DOM only
 */
import { $, safe, escHtml, dayOfYear } from "./utils.js";
import { getProgress, awardPoints } from "./progress.js";
import { aniSay, aniCelebrate } from "./ani.js";

/* ── Mission Definitions ── */
const MISSIONS = [
  {
    id: "m_explore_drone",
    icon: "🚁",
    title: "Изучи профессию пилота",
    desc: "Открой страницу «Пилот дрона» и прочитай о профессии",
    xp: 15,
    type: "daily",
    color: "#0ea5e9",
    link: "drone-pilot.html",
    badge: null,
  },
  {
    id: "m_quiz_today",
    icon: "🧠",
    title: "Пройди тест дня",
    desc: "Ответь на вопрос в разделе «Урок дня»",
    xp: 20,
    type: "daily",
    color: "#6366f1",
    link: null,
    badge: null,
  },
  {
    id: "m_sim_unlock",
    icon: "🎮",
    title: "Открой симуляцию",
    desc: "Пройди урок и разблокируй любую симуляцию",
    xp: 30,
    type: "weekly",
    color: "#ec4899",
    link: "learn.html",
    badge: null,
  },
  {
    id: "m_streak_3",
    icon: "🔥",
    title: "Серия 3 дня",
    desc: "Заходи 3 дня подряд и зарабатывай бонус",
    xp: 25,
    type: "weekly",
    color: "#f59e0b",
    link: null,
    badge: null,
  },
  {
    id: "m_career_explore",
    icon: "🔭",
    title: "Исследуй 3 профессии",
    desc: "Открой страницы трёх разных профессий",
    xp: 20,
    type: "weekly",
    color: "#10b981",
    link: "explorer.html",
    badge: null,
  },
];

/* ── Persistence ── */
const DONE_KEY = "kl_missions_done";

function getDone() {
  try { return JSON.parse(localStorage.getItem(DONE_KEY)) || {}; }
  catch { return {}; }
}

function markDone(id) {
  const d = getDone();
  d[id] = dayOfYear();
  localStorage.setItem(DONE_KEY, JSON.stringify(d));
}

function isDone(id) {
  const d = getDone();
  // Daily: must be today; weekly: within last 7 days
  const m = MISSIONS.find(x => x.id === id);
  if (!d[id]) return false;
  const diff = dayOfYear() - d[id];
  return m?.type === "weekly" ? diff < 7 : diff === 0;
}

/* ── Render ── */

/**
 * Render mission cards into a target container element.
 * @param {HTMLElement} container
 * @param {'daily'|'weekly'|'all'} [filter='all']
 */
export function renderMissionCards(container, filter = "all") {
  if (!container) return;

  const missions = filter === "all"
    ? MISSIONS
    : MISSIONS.filter(m => m.type === filter);

  container.innerHTML = "";
  container.className = "phase5-missions-grid";

  missions.forEach((m, i) => {
    const done = isDone(m.id);
    const card = document.createElement("div");
    card.className = `phase5-mission-card${done ? " phase5-mission-done" : ""}`;
    card.style.setProperty("--mc", m.color);
    card.style.animationDelay = `${i * 60}ms`;
    card.innerHTML = `
      <div class="phase5-mc-top">
        <span class="phase5-mc-icon">${m.icon}</span>
        <span class="phase5-mc-type">${m.type === "daily" ? "Сегодня" : "На неделю"}</span>
        ${done ? '<span class="phase5-mc-done-badge">✅</span>' : ""}
      </div>
      <h4 class="phase5-mc-title">${escHtml(m.title)}</h4>
      <p class="phase5-mc-desc">${escHtml(m.desc)}</p>
      <div class="phase5-mc-footer">
        <span class="phase5-mc-xp">+${m.xp} XP</span>
        ${!done
          ? `<button class="phase5-mc-btn" data-id="${m.id}" data-xp="${m.xp}"${m.link ? ` data-link="${m.link}"` : ""}>
               ${m.link ? "Открыть →" : "Выполнить"}
             </button>`
          : `<span class="phase5-mc-completed">Выполнено!</span>`
        }
      </div>
    `;
    container.appendChild(card);
  });

  // Wire buttons
  container.querySelectorAll(".phase5-mc-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id   = btn.dataset.id;
      const xp   = parseInt(btn.dataset.xp) || 10;
      const link = btn.dataset.link;

      if (isDone(id)) return;
      markDone(id);
      // Notify memory layer (imported by script.js, exposed via custom event)
      document.dispatchEvent(new CustomEvent("phase5:missionComplete", { detail: { id } }));
      awardPoints(xp, "Миссия выполнена");
      aniCelebrate();
      aniSay(`🎯 Миссия выполнена! +${xp} XP`);

      // Refresh card state
      const card = btn.closest(".phase5-mission-card");
      if (card) {
        card.classList.add("phase5-mission-done");
        btn.replaceWith(Object.assign(document.createElement("span"), {
          className: "phase5-mc-completed",
          textContent: "Выполнено!",
        }));
        const badge = document.createElement("span");
        badge.className = "phase5-mc-done-badge";
        badge.textContent = "✅";
        card.querySelector(".phase5-mc-top")?.appendChild(badge);
      }

      if (link) setTimeout(() => { window.location.href = link; }, 900);
    });
  });
}

/* ── Init ── */

/**
 * Initialize mission engine.
 * Renders into #phase5-missions-container if present on page.
 * Also renders into #daily-missions-container as a supplement.
 */
export function initMissionEngine() {
  const primary = document.getElementById("phase5-missions-container");
  if (primary) renderMissionCards(primary, "all");

  // Supplement existing daily missions section with weekly missions (once only)
  const daily = document.getElementById("daily-missions-container");
  if (daily && !document.getElementById("phase5-weekly-missions")) {
    const weeklyWrap = document.createElement("div");
    weeklyWrap.id = "phase5-weekly-missions";
    weeklyWrap.style.marginTop = "20px";
    const label = document.createElement("div");
    label.className = "phase5-missions-label";
    label.textContent = "📅 Миссии на неделю";
    weeklyWrap.appendChild(label);
    renderMissionCards(weeklyWrap, "weekly");
    daily.parentElement?.appendChild(weeklyWrap);
  }
}
