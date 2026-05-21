/**
 * Phase 5.4 — Story + Achiever Engine
 * Rotating stories carousel with hero avatar, quote, mini lesson, optional XP.
 *
 * Exports: initAchieverEngine
 * Data:    data/phase5-stories.json
 * Storage: kl_story_seen (localStorage)
 * Safe:    additive DOM, no ID conflicts
 */
import { safe, escHtml } from "./utils.js";
import { awardPoints } from "./progress.js";
import { aniSay, aniHappy } from "./ani.js";

const SEEN_KEY = "kl_story_seen";
const ROTATE_MS = 6000;

function getSeen() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY)) || []; }
  catch { return []; }
}
function markSeen(id) {
  const s = getSeen();
  if (!s.includes(id)) { s.push(id); localStorage.setItem(SEEN_KEY, JSON.stringify(s)); }
}

/**
 * Render a single story into the carousel container.
 * @param {HTMLElement} container
 * @param {object} story
 * @param {number} total
 * @param {number} idx
 */
function renderStory(container, story, idx, total) {
  container.innerHTML = `
    <div class="phase5-story-card" style="--sc:${story.color}">
      <div class="phase5-story-avatar">${story.avatar}</div>
      <div class="phase5-story-body">
        <div class="phase5-story-quote">"${escHtml(story.quote)}"</div>
        <div class="phase5-story-author">
          <span class="phase5-story-name">${escHtml(story.name)}</span>
          <span class="phase5-story-role">${escHtml(story.role)}</span>
        </div>
        <div class="phase5-story-lesson">
          <span class="phase5-story-lesson-icon">💡</span>
          <span>${escHtml(story.lesson)}</span>
        </div>
        ${story.xp ? `
          <button class="phase5-story-xp-btn" data-id="${story.id}" data-xp="${story.xp}">
            +${story.xp} XP — Запомнить урок
          </button>` : ""}
      </div>
      <div class="phase5-story-dots">
        ${Array.from({length: total}, (_, i) =>
          `<span class="phase5-story-dot${i === idx ? " active" : ""}"></span>`
        ).join("")}
      </div>
    </div>
  `;

  // XP button
  const xpBtn = container.querySelector(".phase5-story-xp-btn");
  if (xpBtn) {
    const seen = getSeen();
    if (seen.includes(story.id)) {
      xpBtn.textContent = "✅ Урок запомнен";
      xpBtn.disabled = true;
    }
    xpBtn.addEventListener("click", () => {
      if (getSeen().includes(story.id)) return;
      markSeen(story.id);
      awardPoints(story.xp, "История");
      aniHappy();
      aniSay(`💡 Отлично! +${story.xp} XP за урок!`);
      xpBtn.textContent = "✅ Урок запомнен";
      xpBtn.disabled = true;
    });
  }
}

/**
 * Initialize achiever engine carousel.
 * Renders into any element with id="phase5-achiever-carousel" or
 * class="phase5-achiever-carousel".
 */
export async function initAchieverEngine() {
  const containers = [
    document.getElementById("phase5-achiever-carousel"),
    ...Array.from(document.querySelectorAll(".phase5-achiever-carousel")),
  ].filter(Boolean);

  if (!containers.length) return;

  let stories = [];
  try {
    const res = await fetch("data/phase5-stories.json");
    if (res.ok) stories = await res.json();
  } catch {
    // Fallback: inline minimal story
    stories = [{
      id: "fallback",
      avatar: "🚀",
      name: "Анюша",
      role: "AI-помощник",
      quote: "Каждый день — новый шаг к мечте!",
      lesson: "Начни с малого: выбери профессию и пройди первый урок.",
      xp: 5,
      color: "#7c3aed",
    }];
  }

  if (!stories.length) return;

  containers.forEach(container => {
    let idx = 0;
    let timer = null;

    const startTimer = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        idx = (idx + 1) % stories.length;
        render();
      }, ROTATE_MS);
    };

    const render = () => {
      renderStory(container, stories[idx], idx, stories.length);
      // Dot click navigation
      container.querySelectorAll(".phase5-story-dot").forEach((dot, i) => {
        dot.addEventListener("click", () => { idx = i; render(); startTimer(); });
      });
    };

    render();
    startTimer();

    // Pause on hover, resume on leave
    container.addEventListener("mouseenter", () => clearInterval(timer));
    container.addEventListener("mouseleave", () => startTimer());
  });
}
