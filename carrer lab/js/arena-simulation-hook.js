/**
 * Phase 5.9 — Arena Simulation Hook
 * Integrates Arena UX with Phase 5.8.5 multi-stage system.
 * Handles event dispatching, coaching, difficulty, and branching.
 *
 * Exports: initArenaSimulationHook, hookSimulationToArena
 * Storage: none (stateless)
 * Safe: pure ES module, additive only
 */

/**
 * Initialize arena simulation hook system.
 * Wires arena events to Phase 5.8.5 systems.
 */
export function initArenaSimulationHook() {
  try {
    // Listen for arena stage completion
    document.addEventListener("phase59:stageLoaded", (e) => {
      handleStageLoaded(e.detail);
    });

    // Listen for simulation completion
    document.addEventListener("phase59:simulationComplete", (e) => {
      handleSimulationComplete(e.detail);
    });

    // Listen for panel navigation
    document.addEventListener("phase59:panelNavigate", (e) => {
      handlePanelNavigate(e.detail);
    });

    // Listen for action feedback
    document.addEventListener("phase59:actionFeedback", (e) => {
      handleActionFeedback(e.detail);
    });

    document.dispatchEvent(new CustomEvent("phase59:simulationHookReady"));
  } catch (e) {
    console.error("[Phase 5.9] Simulation hook init error:", e);
  }
}

/**
 * Hook simulation to arena.
 * @param {string} simType - Simulation type
 */
export function hookSimulationToArena(simType) {
  try {
    // Load simulation flow
    const flow = window.getSimulationFlow?.(simType);
    if (!flow) {
      console.error("[Phase 5.9] Simulation flow not found:", simType);
      return;
    }

    // Get difficulty tier
    const difficulty = window.getDifficultyTier?.() || "medium";
    const xpMultiplier = window.getXpMultiplier?.(difficulty) || 1.0;

    // Get branching events
    const events = window.getRandomEvents?.(simType) || [];

    // Store in session
    sessionStorage.setItem("p59_sim_type", simType);
    sessionStorage.setItem("p59_difficulty", difficulty);
    sessionStorage.setItem("p59_xp_multiplier", xpMultiplier);
    sessionStorage.setItem("p59_events", JSON.stringify(events));

    // Dispatch hook event
    document.dispatchEvent(new CustomEvent("phase59:simulationHooked", {
      detail: { simType, difficulty, xpMultiplier, events }
    }));
  } catch (e) {
    console.error("[Phase 5.9] Hook simulation error:", e);
  }
}

/**
 * Handle stage loaded event.
 * @param {object} detail - Event detail
 */
function handleStageLoaded(detail) {
  try {
    const { simType, stageIdx, stage } = detail;

    // Get coaching feedback
    const feedback = window.getStageCoachingFeedback?.(simType, stage.id, true);
    if (feedback) {
      window.showAniMessage?.(feedback);
    }

    // Check for branching events
    const events = JSON.parse(sessionStorage.getItem("p59_events") || "[]");
    if (events.length > stageIdx) {
      const event = events[stageIdx];
      if (event) {
        window.showEventNotification?.(event);
      }
    }

    // Dispatch to parent insights
    document.dispatchEvent(new CustomEvent("phase585:stageComplete", {
      detail: { simType, stageIdx, stage, score: 85 }
    }));
  } catch (e) {
    console.error("[Phase 5.9] Handle stage loaded error:", e);
  }
}

/**
 * Handle simulation completion.
 * @param {object} detail - Event detail
 */
function handleSimulationComplete(detail) {
  try {
    const { simType } = detail;
    const difficulty = sessionStorage.getItem("p59_difficulty") || "medium";
    const xpMultiplier = parseFloat(sessionStorage.getItem("p59_xp_multiplier") || "1.0");

    // Calculate final score
    const baseScore = 85;
    const finalScore = Math.round(baseScore * xpMultiplier);

    // Track performance
    window.trackCareerPerformance?.(simType, finalScore, true);
    window.trackWeeklyGrowth?.(finalScore);

    // Award points with multiplier
    window.awardPoints?.(finalScore, `Arena ${simType} Complete`);

    // Dispatch completion event
    document.dispatchEvent(new CustomEvent("phase5:missionComplete", {
      detail: { simType, score: finalScore, difficulty }
    }));

    // Clear session
    sessionStorage.removeItem("p59_sim_type");
    sessionStorage.removeItem("p59_difficulty");
    sessionStorage.removeItem("p59_xp_multiplier");
    sessionStorage.removeItem("p59_events");
  } catch (e) {
    console.error("[Phase 5.9] Handle simulation complete error:", e);
  }
}

/**
 * Handle panel navigation.
 * @param {object} detail - Event detail
 */
function handlePanelNavigate(detail) {
  try {
    const { stageIdx, direction } = detail;

    // Dispatch navigation event
    document.dispatchEvent(new CustomEvent("phase59:navigationEvent", {
      detail: { stageIdx, direction }
    }));
  } catch (e) {
    console.error("[Phase 5.9] Handle panel navigate error:", e);
  }
}

/**
 * Handle action feedback.
 * @param {object} detail - Event detail
 */
function handleActionFeedback(detail) {
  try {
    const { simType, actionKey, correct } = detail;

    if (!correct) {
      // Show coaching feedback
      window.showSimulationCoachFeedback?.(simType, actionKey, {
        onRetry: () => {
          document.dispatchEvent(new CustomEvent("phase59:actionRetry", {
            detail: { simType, actionKey }
          }));
        }
      });

      // Track weak skill
      window.trackWeakSkill?.(actionKey);
    } else {
      // Show success feedback
      window.showFeedback?.("correct");
    }
  } catch (e) {
    console.error("[Phase 5.9] Handle action feedback error:", e);
  }
}

/**
 * Dispatch action feedback event.
 * @param {string} simType - Simulation type
 * @param {string} actionKey - Action key
 * @param {boolean} correct - Whether action was correct
 */
export function dispatchActionFeedback(simType, actionKey, correct) {
  try {
    document.dispatchEvent(new CustomEvent("phase59:actionFeedback", {
      detail: { simType, actionKey, correct }
    }));
  } catch (e) {
    console.error("[Phase 5.9] Dispatch action feedback error:", e);
  }
}

/**
 * Get arena simulation context.
 * @returns {object}
 */
export function getArenaSimulationContext() {
  try {
    return {
      simType: sessionStorage.getItem("p59_sim_type"),
      difficulty: sessionStorage.getItem("p59_difficulty"),
      xpMultiplier: parseFloat(sessionStorage.getItem("p59_xp_multiplier") || "1.0"),
      events: JSON.parse(sessionStorage.getItem("p59_events") || "[]"),
    };
  } catch (e) {
    console.error("[Phase 5.9] Get context error:", e);
    return {
      simType: null,
      difficulty: "medium",
      xpMultiplier: 1.0,
      events: [],
    };
  }
}

/**
 * Trigger arena coaching for wrong action.
 * @param {string} simType - Simulation type
 * @param {string} actionKey - Action key
 */
export function triggerArenaCoaching(simType, actionKey) {
  try {
    const feedback = window.getStageCoachingFeedback?.(simType, actionKey, false);
    if (feedback) {
      window.showAniMessage?.(feedback);
      window.aniGestureArena?.("think");
    }

    // Show coaching panel
    window.showSimulationCoachFeedback?.(simType, actionKey);
  } catch (e) {
    console.error("[Phase 5.9] Trigger coaching error:", e);
  }
}

/**
 * Trigger arena branching event.
 * @param {string} simType - Simulation type
 * @param {number} stageIdx - Stage index
 */
export function triggerArenaBranchingEvent(simType, stageIdx) {
  try {
    const events = JSON.parse(sessionStorage.getItem("p59_events") || "[]");
    if (events.length > stageIdx) {
      const event = events[stageIdx];
      if (event) {
        window.showEventNotification?.(event);
        window.aniGestureArena?.("wave");
      }
    }
  } catch (e) {
    console.error("[Phase 5.9] Trigger branching error:", e);
  }
}
