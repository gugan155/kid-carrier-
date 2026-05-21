/**
 * Phase 5.8.5 — Next Recommended Action Engine
 * Suggests next lesson, mission, difficulty tier, or elite challenge
 * based on current progress and performance.
 *
 * Exports: initNextActionEngine, getNextRecommendedAction, 
 *          renderNextActionHint, dismissNextActionHint
 * Storage: kl_next_action_* (recommendations cache)
 * Safe: pure ES module, additive only
 */

const NEXT_ACTION_KEY = "kl_next_action";
const NEXT_ACTION_DISMISSED_KEY = "kl_next_action_dismissed";

/**
 * Get next recommended action based on progress.
 * @returns {object} Recommendation object
 */
export function getNextRecommendedAction() {
  try {
    const progress = window.getProgress?.() || { points: 0, simDone: 0, quizDone: 0 };
    const weakArea = window.getWeakestArea?.() || null;
    const unlockedSims = window.getUnlockedSimulationsCount?.() || 0;
    
    // Rule 1: If no simulations completed, suggest first simulation
    if (progress.simDone === 0) {
      return {
        type: "simulation",
        action: "pilot_sim",
        title: "Начни с пилота дрона",
        description: "Первая симуляция поможет тебе понять, как работают карьеры",
        icon: "✈️",
        priority: "high",
        cta: "Начать симуляцию",
      };
    }

    // Rule 2: If weak area exists, suggest lesson
    if (weakArea) {
      return {
        type: "lesson",
        action: "learn",
        title: `Потренируйся в ${weakArea}`,
        description: `Это твоя слабая сторона. Практика поможет улучшить навыки!`,
        icon: "📚",
        priority: "high",
        cta: "Открыть урок",
      };
    }

    // Rule 3: If XP is high enough, suggest elite challenge
    if (progress.points >= 200 && unlockedSims >= 2) {
      return {
        type: "elite",
        action: "elite_challenge",
        title: "Разблокирована элитная миссия",
        description: "Ты готов к более сложному вызову! Получи 2x XP!",
        icon: "⚡",
        priority: "high",
        cta: "Принять вызов",
      };
    }

    // Rule 4: If quiz not done today, suggest quiz
    if (progress.quizDone < 1) {
      return {
        type: "quiz",
        action: "quiz",
        title: "Пройди тест дня",
        description: "Ежедневный тест помогает закрепить знания",
        icon: "🧠",
        priority: "medium",
        cta: "Начать тест",
      };
    }

    // Rule 5: Default - suggest next simulation
    const nextSim = ["doctor", "drone", "cyber"].find(s => !window.isSimUnlocked?.(s + "_sim"));
    if (nextSim) {
      const simMap = {
        doctor: { icon: "🏥", name: "Врач" },
        drone: { icon: "🚁", name: "Инженер дронов" },
        cyber: { icon: "🔐", name: "Кибер-защитник" },
      };
      const sim = simMap[nextSim];
      return {
        type: "simulation",
        action: nextSim + "_sim",
        title: `Откройте ${sim.name}`,
        description: "Ты готов к новой карьере!",
        icon: sim.icon,
        priority: "medium",
        cta: "Открыть симуляцию",
      };
    }

    // Fallback
    return {
      type: "mission",
      action: "missions",
      title: "Выполни новую миссию",
      description: "Миссии дают бонусные очки и значки",
      icon: "🎯",
      priority: "low",
      cta: "Открыть миссии",
    };
  } catch (e) {
    console.error("[Phase 5.8.5] Next action error:", e);
    return null;
  }
}

/**
 * Save next action recommendation.
 * @param {object} action - Action object
 */
function saveNextAction(action) {
  try {
    localStorage.setItem(NEXT_ACTION_KEY, JSON.stringify(action));
  } catch (e) {
    console.error("[Phase 5.8.5] Save next action error:", e);
  }
}

/**
 * Get saved next action.
 * @returns {object | null}
 */
function getSavedNextAction() {
  try {
    return JSON.parse(localStorage.getItem(NEXT_ACTION_KEY)) || null;
  } catch {
    return null;
  }
}

/**
 * Check if next action was dismissed.
 * @returns {boolean}
 */
function isNextActionDismissed() {
  try {
    const dismissed = JSON.parse(localStorage.getItem(NEXT_ACTION_DISMISSED_KEY)) || {};
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return dismissed.day === today;
  } catch {
    return false;
  }
}

/**
 * Dismiss next action hint for today.
 */
export function dismissNextActionHint() {
  try {
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    localStorage.setItem(NEXT_ACTION_DISMISSED_KEY, JSON.stringify({ day: today }));
  } catch (e) {
    console.error("[Phase 5.8.5] Dismiss error:", e);
  }
}

/**
 * Render next action hint on dashboard.
 * @param {HTMLElement} container
 */
export function renderNextActionHint(container) {
  if (!container || isNextActionDismissed()) return;

  const action = getNextRecommendedAction();
  if (!action) return;

  saveNextAction(action);

  const priorityClass = `p585-priority-${action.priority}`;
  
  container.className = `p585-next-action-hint ${priorityClass}`;
  container.innerHTML = `
    <div class="p585-hint-content">
      <div class="p585-hint-icon">${action.icon}</div>
      <div class="p585-hint-text">
        <div class="p585-hint-title">${action.title}</div>
        <div class="p585-hint-desc">${action.description}</div>
      </div>
      <button class="p585-hint-cta" id="p585-action-btn">${action.cta}</button>
      <button class="p585-hint-close" id="p585-dismiss-btn">✕</button>
    </div>
  `;

  // Wire CTA button
  const ctaBtn = container.querySelector("#p585-action-btn");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("phase585:nextActionClicked", {
        detail: { action }
      }));
      
      // Navigate based on action type
      if (action.action === "learn") {
        window.location.href = "learn.html";
      } else if (action.action === "quiz") {
        window.location.href = "quiz.html";
      } else if (action.action === "missions") {
        window.location.href = "index.html#missions";
      } else if (action.action.includes("_sim")) {
        // Trigger simulation open
        const simBtn = document.getElementById("open-" + action.action.replace("_sim", "-sim"));
        if (simBtn) simBtn.click();
      }
    });
  }

  // Wire dismiss button
  const dismissBtn = container.querySelector("#p585-dismiss-btn");
  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      dismissNextActionHint();
      container.style.display = "none";
    });
  }
}

/**
 * Initialize next action engine.
 * Hooks into progress updates to refresh recommendations.
 * Safe to call multiple times.
 */
export function initNextActionEngine() {
  try {
    // Listen for points awarded to refresh recommendations
    document.addEventListener("phase5:pointsAwarded", () => {
      const action = getNextRecommendedAction();
      if (action) {
        saveNextAction(action);
        document.dispatchEvent(new CustomEvent("phase585:nextActionUpdated", {
          detail: { action }
        }));
      }
    });

    // Listen for mission completion
    document.addEventListener("phase5:missionComplete", () => {
      const action = getNextRecommendedAction();
      if (action) {
        saveNextAction(action);
        document.dispatchEvent(new CustomEvent("phase585:nextActionUpdated", {
          detail: { action }
        }));
      }
    });

    document.dispatchEvent(new CustomEvent("phase585:nextActionEngineReady"));
  } catch (e) {
    console.error("[Phase 5.8.5] Next action engine init error:", e);
  }
}
