/**
 * Phase 5.8C — Simulation Coaching Feedback
 * Provides contextual coaching after wrong simulation actions.
 * Explains why action was wrong and suggests retry.
 *
 * Exports: initSimulationCoach, showSimulationCoachFeedback
 * Storage: none (stateless)
 * Safe: pure ES module, hooks into existing simulation callbacks
 */

/**
 * Coaching feedback database by simulation type and action.
 * Structure: { simType: { actionKey: { wrong: "explanation", retry: "suggestion" } } }
 */
const COACH_DB = {
  pilot: {
    skip_wind_check: {
      wrong: "Пилоты всегда проверяют ветер перед посадкой! Это критично для безопасности.",
      retry: "Попробуй ещё раз. Сначала проверь направление ветра 💨",
    },
    wrong_altitude: {
      wrong: "Высота была неправильной. Нужно снижаться плавно и контролировать скорость.",
      retry: "Отрегулируй высоту и скорость снижения. Ты справишься! ✈️",
    },
    skip_checklist: {
      wrong: "Профессиональные пилоты никогда не пропускают предполётный чек-лист!",
      retry: "Вернись и проверь все системы самолёта перед взлётом 🔧",
    },
  },
  doctor: {
    skip_temperature: {
      wrong: "Температура пациента — первое, что нужно проверить! Это основной симптом.",
      retry: "Начни с измерения температуры. Это даст тебе важную информацию 🌡️",
    },
    wrong_medicine: {
      wrong: "Это лекарство не подходит для этого диагноза. Нужно выбрать правильное.",
      retry: "Проанализируй симптомы ещё раз и выбери подходящее лекарство 💊",
    },
    skip_allergy_check: {
      wrong: "Всегда проверяй аллергию перед назначением лекарства! Это может быть опасно.",
      retry: "Спроси пациента об аллергии перед тем, как назначить лекарство ⚠️",
    },
  },
  drone: {
    skip_obstacle_scan: {
      wrong: "Дроны должны сканировать препятствия перед взлётом! Это предотвращает столкновения.",
      retry: "Сначала отсканируй окружающее пространство на предмет препятствий 🔍",
    },
    wrong_battery: {
      wrong: "Батарея разрядилась! Нужно было проверить уровень заряда перед полётом.",
      retry: "Убедись, что батарея полностью заряжена перед взлётом 🔋",
    },
    skip_wind_check: {
      wrong: "Сильный ветер может сбить дрон с курса. Всегда проверяй погоду!",
      retry: "Проверь скорость ветра перед взлётом. Безопасность прежде всего! 💨",
    },
  },
  cyber: {
    skip_password_check: {
      wrong: "Слабый пароль — главная уязвимость! Всегда используй надёжные пароли.",
      retry: "Создай надёжный пароль с буквами, цифрами и символами 🔐",
    },
    wrong_firewall: {
      wrong: "Брандмауэр должен быть включен! Это первая линия защиты от атак.",
      retry: "Включи брандмауэр и настрой правила доступа 🛡️",
    },
    skip_backup: {
      wrong: "Резервная копия — спасение при атаке! Никогда не пропускай бэкап.",
      retry: "Создай резервную копию данных перед тем, как продолжить 💾",
    },
  },
};

/**
 * Get coaching feedback for a simulation action.
 * @param {string} simType - Simulation type (pilot, doctor, drone, cyber)
 * @param {string} actionKey - Action key (e.g., "skip_wind_check")
 * @returns {{wrong: string, retry: string} | null}
 */
function getCoachingFeedback(simType, actionKey) {
  return COACH_DB[simType]?.[actionKey] || null;
}

/**
 * Show simulation coaching feedback.
 * Displays explanation and retry suggestion.
 * Integrates with Ani for voice coaching.
 *
 * @param {string} simType - Simulation type
 * @param {string} actionKey - Action key
 * @param {object} [opts] - Options
 * @param {function} [opts.onRetry] - Callback when user clicks retry
 */
export function showSimulationCoachFeedback(simType, actionKey, opts = {}) {
  const feedback = getCoachingFeedback(simType, actionKey);
  if (!feedback) return;

  try {
    // Create coaching panel
    const panel = document.createElement("div");
    panel.className = "p58-coach-panel";
    panel.innerHTML = `
      <div class="p58-coach-content">
        <div class="p58-coach-icon">🤔</div>
        <div class="p58-coach-text">
          <div class="p58-coach-wrong">${feedback.wrong}</div>
          <div class="p58-coach-retry">${feedback.retry}</div>
        </div>
        <button class="p58-coach-btn" id="p58-coach-retry-btn">Попробовать ещё раз</button>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Retry button handler
    const retryBtn = panel.querySelector("#p58-coach-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        panel.remove();
        if (typeof opts.onRetry === "function") {
          opts.onRetry();
        }
      });
    }
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (panel.parentElement) panel.remove();
    }, 8000);
    
    // Dispatch event for Ani coaching voice
    document.dispatchEvent(new CustomEvent("phase58:coachFeedback", {
      detail: { simType, actionKey, feedback }
    }));
    
  } catch (e) {
    console.error("[Phase 5.8C] Coach feedback error:", e);
  }
}

/**
 * Initialize simulation coach.
 * Hooks into simulation result callbacks.
 * Safe to call multiple times.
 */
export function initSimulationCoach() {
  try {
    document.dispatchEvent(new CustomEvent("phase58:simulationCoachReady"));
  } catch (e) {
    console.error("[Phase 5.8C] Simulation Coach init error:", e);
  }
}
