/**
 * Phase 5.9 — Arena UX Main Engine
 * Immersive 3D/2.5D arena with cinematic panels, layered scrolling,
 * and interactive simulation environments.
 *
 * Exports: initArena, startArenaSimulation, exitArena, getArenaState
 * Storage: kl_arena_* (session-based)
 * Safe: pure ES module, additive only
 */

const ARENA_STATE_KEY = "kl_arena_state";
const ARENA_ACTIVE_KEY = "kl_arena_active";

/**
 * Arena state object.
 */
let arenaState = {
  active: false,
  currentSimType: null,
  currentStage: 0,
  panelStack: [],
  parallaxLayers: [],
  aniVisible: true,
};

/**
 * Get current arena state.
 * @returns {object}
 */
export function getArenaState() {
  return { ...arenaState };
}

/**
 * Initialize Arena UX system.
 * Sets up viewport, layers, and event listeners.
 * Safe to call multiple times.
 */
export function initArena() {
  try {
    // Create arena container if not exists
    if (!document.getElementById("p59-arena-container")) {
      const container = document.createElement("div");
      container.id = "p59-arena-container";
      container.className = "p59-arena-container";
      document.body.appendChild(container);
    }

    // Create Ani co-pilot widget
    if (!document.getElementById("p59-ani-copilot")) {
      const aniWidget = document.createElement("div");
      aniWidget.id = "p59-ani-copilot";
      aniWidget.className = "p59-ani-copilot";
      aniWidget.innerHTML = `
        <div class="p59-ani-frame">
          <div class="p59-ani-char">🤖</div>
          <div class="p59-ani-bubble" id="p59-ani-bubble"></div>
        </div>
      `;
      document.body.appendChild(aniWidget);
    }

    // Create parallax layers
    createParallaxLayers();

    // Wire keyboard/touch controls
    wireArenaControls();

    // Dispatch ready event
    document.dispatchEvent(new CustomEvent("phase59:arenaReady"));
  } catch (e) {
    console.error("[Phase 5.9] Arena init error:", e);
  }
}

/**
 * Create parallax layer structure.
 */
function createParallaxLayers() {
  const container = document.getElementById("p59-arena-container");
  if (!container) return;

  const layers = [
    { id: "p59-bg-far", depth: 0.3, label: "Background" },
    { id: "p59-bg-mid", depth: 0.6, label: "Midground" },
    { id: "p59-bg-near", depth: 0.9, label: "Foreground" },
    { id: "p59-elements", depth: 1.0, label: "Interactive" },
  ];

  layers.forEach(layer => {
    if (!document.getElementById(layer.id)) {
      const el = document.createElement("div");
      el.id = layer.id;
      el.className = `p59-parallax-layer p59-depth-${Math.round(layer.depth * 10)}`;
      el.style.setProperty("--depth", layer.depth);
      container.appendChild(el);
    }
  });

  arenaState.parallaxLayers = layers;
}

/**
 * Wire arena keyboard and touch controls.
 */
function wireArenaControls() {
  document.addEventListener("keydown", (e) => {
    if (!arenaState.active) return;

    // ESC to exit arena
    if (e.key === "Escape") {
      exitArena();
    }
  });

  // Touch swipe to navigate panels
  let touchStart = 0;
  document.addEventListener("touchstart", (e) => {
    if (!arenaState.active) return;
    touchStart = e.touches[0].clientX;
  });

  document.addEventListener("touchend", (e) => {
    if (!arenaState.active) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left - next panel
        navigateArenaPanel(1);
      } else {
        // Swiped right - prev panel
        navigateArenaPanel(-1);
      }
    }
  });
}

/**
 * Navigate arena panels.
 * @param {number} direction - 1 for next, -1 for prev
 */
function navigateArenaPanel(direction) {
  const newIdx = arenaState.currentStage + direction;
  const flow = window.getSimulationFlow?.(arenaState.currentSimType);
  
  if (!flow) return;
  if (newIdx < 0 || newIdx >= flow.stages.length) return;

  arenaState.currentStage = newIdx;
  
  document.dispatchEvent(new CustomEvent("phase59:panelNavigate", {
    detail: { stageIdx: newIdx, direction }
  }));
}

/**
 * Start arena simulation.
 * Transitions viewport into arena layout with cinematic effect.
 * @param {string} simType - Simulation type (pilot, doctor, drone, cyber)
 */
export function startArenaSimulation(simType) {
  try {
    if (!["pilot", "doctor", "drone", "cyber"].includes(simType)) {
      console.error("[Phase 5.9] Invalid simulation type:", simType);
      return;
    }

    arenaState.active = true;
    arenaState.currentSimType = simType;
    arenaState.currentStage = 0;
    arenaState.aniVisible = true;

    // Save state
    localStorage.setItem(ARENA_ACTIVE_KEY, JSON.stringify(arenaState));

    // Get arena container
    const container = document.getElementById("p59-arena-container");
    if (!container) {
      console.error("[Phase 5.9] Arena container not found");
      return;
    }

    // Show arena with cinematic transition
    container.classList.add("p59-active");
    container.style.display = "flex";

    // Animate Ani co-pilot entrance
    const aniWidget = document.getElementById("p59-ani-copilot");
    if (aniWidget) {
      aniWidget.classList.add("p59-visible");
    }

    // Dispatch event
    document.dispatchEvent(new CustomEvent("phase59:arenaStart", {
      detail: { simType }
    }));

    // Load first stage
    loadArenaStage(simType, 0);
  } catch (e) {
    console.error("[Phase 5.9] Start arena error:", e);
  }
}

/**
 * Load arena stage content.
 * @param {string} simType - Simulation type
 * @param {number} stageIdx - Stage index
 */
export function loadArenaStage(simType, stageIdx) {
  try {
    const flow = window.getSimulationFlow?.(simType);
    if (!flow || stageIdx >= flow.stages.length) return;

    const stage = flow.stages[stageIdx];
    const container = document.getElementById("p59-elements");
    if (!container) return;

    // Clear previous stage
    container.innerHTML = "";

    // Create stage panel
    const panel = document.createElement("div");
    panel.className = `p59-stage-panel p59-stage-${stage.type}`;
    panel.innerHTML = `
      <div class="p59-panel-header">
        <div class="p59-stage-title">${stage.name}</div>
        <div class="p59-stage-progress">${stageIdx + 1} / ${flow.stages.length}</div>
      </div>
      <div class="p59-panel-content" id="p59-stage-content"></div>
      <div class="p59-panel-footer">
        <button class="p59-btn-action" id="p59-btn-continue">Продолжить →</button>
      </div>
    `;

    container.appendChild(panel);

    // Animate panel entrance
    panel.classList.add("p59-panel-enter");

    // Wire continue button
    const continueBtn = panel.querySelector("#p59-btn-continue");
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        completeArenaStage(simType, stageIdx);
      });
    }

    // Dispatch event
    document.dispatchEvent(new CustomEvent("phase59:stageLoaded", {
      detail: { simType, stageIdx, stage }
    }));
  } catch (e) {
    console.error("[Phase 5.9] Load stage error:", e);
  }
}

/**
 * Complete arena stage.
 * @param {string} simType - Simulation type
 * @param {number} stageIdx - Stage index
 */
export function completeArenaStage(simType, stageIdx) {
  try {
    const flow = window.getSimulationFlow?.(simType);
    if (!flow) return;

    // Record stage completion
    window.completeSimulationStage?.(simType, stageIdx, 85);

    // Move to next stage
    const nextStageIdx = stageIdx + 1;
    
    if (nextStageIdx >= flow.stages.length) {
      // Simulation complete
      completeArenaSimulation(simType);
    } else {
      // Load next stage
      arenaState.currentStage = nextStageIdx;
      loadArenaStage(simType, nextStageIdx);
    }
  } catch (e) {
    console.error("[Phase 5.9] Complete stage error:", e);
  }
}

/**
 * Complete arena simulation.
 * @param {string} simType - Simulation type
 */
function completeArenaSimulation(simType) {
  try {
    // Award points
    window.awardPoints?.(50, "Arena Simulation");

    // Track performance
    window.trackCareerPerformance?.(simType, 85, true);
    window.trackWeeklyGrowth?.(50);

    // Show completion screen
    const container = document.getElementById("p59-elements");
    if (container) {
      container.innerHTML = `
        <div class="p59-completion-screen">
          <div class="p59-completion-icon">🎉</div>
          <div class="p59-completion-title">Симуляция завершена!</div>
          <div class="p59-completion-score">+50 XP</div>
          <button class="p59-btn-action" id="p59-btn-exit">Выход из арены</button>
        </div>
      `;

      const exitBtn = container.querySelector("#p59-btn-exit");
      if (exitBtn) {
        exitBtn.addEventListener("click", () => exitArena());
      }
    }

    // Dispatch event
    document.dispatchEvent(new CustomEvent("phase59:simulationComplete", {
      detail: { simType }
    }));
  } catch (e) {
    console.error("[Phase 5.9] Complete simulation error:", e);
  }
}

/**
 * Exit arena.
 * Transitions back to normal layout.
 */
export function exitArena() {
  try {
    arenaState.active = false;
    arenaState.currentSimType = null;
    arenaState.currentStage = 0;

    // Clear state
    localStorage.removeItem(ARENA_ACTIVE_KEY);

    // Hide arena
    const container = document.getElementById("p59-arena-container");
    if (container) {
      container.classList.remove("p59-active");
      setTimeout(() => {
        container.style.display = "none";
      }, 300);
    }

    // Hide Ani co-pilot
    const aniWidget = document.getElementById("p59-ani-copilot");
    if (aniWidget) {
      aniWidget.classList.remove("p59-visible");
    }

    // Dispatch event
    document.dispatchEvent(new CustomEvent("phase59:arenaExit"));
  } catch (e) {
    console.error("[Phase 5.9] Exit arena error:", e);
  }
}

/**
 * Show Ani co-pilot message.
 * @param {string} message - Message to display
 */
export function showAniMessage(message) {
  try {
    const bubble = document.getElementById("p59-ani-bubble");
    if (bubble) {
      bubble.textContent = message;
      bubble.classList.add("p59-bubble-show");
      
      setTimeout(() => {
        bubble.classList.remove("p59-bubble-show");
      }, 3000);
    }
  } catch (e) {
    console.error("[Phase 5.9] Show Ani message error:", e);
  }
}

/**
 * Animate Ani gesture.
 * @param {string} gesture - Gesture name (wave, celebrate, think, etc.)
 */
export function aniGestureArena(gesture) {
  try {
    const char = document.querySelector(".p59-ani-char");
    if (!char) return;

    char.classList.add(`p59-ani-${gesture}`);
    setTimeout(() => {
      char.classList.remove(`p59-ani-${gesture}`);
    }, 800);
  } catch (e) {
    console.error("[Phase 5.9] Ani gesture error:", e);
  }
}
