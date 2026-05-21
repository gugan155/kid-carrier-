/* ═══════════════════════════════════════════════════════════════
   PHASE 6.1 — SUBSCRIPTION PREVIEW SYSTEM
   Monetization MVP: 7-day free preview + 30-day trial
   ═══════════════════════════════════════════════════════════════ */

// ── SUBSCRIPTION STATE ──
let g_subscription_initialized = false;

// ── INIT ──
export function initSubscriptionPreview() {
  if (g_subscription_initialized) return;
  g_subscription_initialized = true;

  try {
    // Initialize subscription on first load
    if (!getSubscriptionStart()) {
      setSubscriptionStart(new Date().toISOString());
      setSubscriptionStatus("free");
    }

    // Check if preview expired and show trial option
    const days = getRemainingPreviewDays();
    if (days <= 0 && getSubscriptionStatus() === "free") {
      showTrialOption();
    }

    console.log("[Phase 6.1] Subscription preview initialized. Status:", getSubscriptionStatus());
    document.dispatchEvent(new CustomEvent("phase6:subscriptionReady"));
  } catch (err) {
    console.error("[Phase 6.1] Error initializing subscription preview:", err);
  }
}

// ── SUBSCRIPTION STATUS ──
export function getSubscriptionStatus() {
  try {
    return localStorage.getItem("kl_subscription_status") || "free";
  } catch (err) {
    console.error("[Phase 6.1] Error getting subscription status:", err);
    return "free";
  }
}

export function setSubscriptionStatus(status) {
  try {
    localStorage.setItem("kl_subscription_status", status);
    document.dispatchEvent(new CustomEvent("phase6:subscriptionStatusChanged", { detail: { status } }));
  } catch (err) {
    console.error("[Phase 6.1] Error setting subscription status:", err);
  }
}

// ── PREVIEW TIMER ──
export function getSubscriptionStart() {
  try {
    return localStorage.getItem("kl_subscription_start");
  } catch (err) {
    console.error("[Phase 6.1] Error getting subscription start:", err);
    return null;
  }
}

export function setSubscriptionStart(timestamp) {
  try {
    localStorage.setItem("kl_subscription_start", timestamp);
  } catch (err) {
    console.error("[Phase 6.1] Error setting subscription start:", err);
  }
}

export function getRemainingPreviewDays() {
  try {
    const start = getSubscriptionStart();
    if (!start) return 7;

    const startDate = new Date(start);
    const now = new Date();
    const diffMs = now - startDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, 7 - diffDays);

    return remaining;
  } catch (err) {
    console.error("[Phase 6.1] Error calculating remaining preview days:", err);
    return 7;
  }
}

// ── TRIAL ACTIVATION ──
export function getTrialActivated() {
  try {
    return localStorage.getItem("kl_trial_activated");
  } catch (err) {
    console.error("[Phase 6.1] Error getting trial activated:", err);
    return null;
  }
}

export function getRemainingTrialDays() {
  try {
    const activated = getTrialActivated();
    if (!activated) return 0;

    const activatedDate = new Date(activated);
    const now = new Date();
    const diffMs = now - activatedDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, 30 - diffDays);

    return remaining;
  } catch (err) {
    console.error("[Phase 6.1] Error calculating remaining trial days:", err);
    return 0;
  }
}

export function activateTrial() {
  try {
    const now = new Date().toISOString();
    localStorage.setItem("kl_trial_activated", now);
    setSubscriptionStatus("trial");

    console.log("[Phase 6.1] Trial activated. 30 days remaining.");
    document.dispatchEvent(new CustomEvent("phase6:trialActivated"));
    return true;
  } catch (err) {
    console.error("[Phase 6.1] Error activating trial:", err);
    return false;
  }
}

// ── PREMIUM FEATURE LOCKING ──
export function isPremiumFeature(featureId) {
  try {
    const status = getSubscriptionStatus();
    if (status === "premium") return false; // Not locked for premium users

    // Check if trial is still active
    if (status === "trial") {
      const trialDays = getRemainingTrialDays();
      if (trialDays > 0) return false; // Not locked during trial
    }

    // Check if preview is still active
    if (status === "free") {
      const previewDays = getRemainingPreviewDays();
      if (previewDays > 0) {
        // Some features are locked even during preview
        const alwaysLockedFeatures = ["elite_challenge", "elite_stage", "premium_analytics"];
        return alwaysLockedFeatures.includes(featureId);
      }
    }

    return true; // Feature is locked
  } catch (err) {
    console.error("[Phase 6.1] Error checking premium feature:", err);
    return false;
  }
}

export function lockPremiumSimulation(simType) {
  try {
    if (isPremiumFeature("elite_challenge")) {
      return true; // Simulation is locked
    }
    return false; // Simulation is not locked
  } catch (err) {
    console.error("[Phase 6.1] Error locking premium simulation:", err);
    return false;
  }
}

// ── UPGRADE CTA ──
export function showUpgradeCTA(context = "default") {
  try {
    const status = getSubscriptionStatus();
    if (status === "premium") return; // Don't show for premium users

    const modal = document.createElement("div");
    modal.className = "p6-upgrade-modal";
    modal.innerHTML = `
      <div class="p6-upgrade-content">
        <div class="p6-upgrade-icon">🎁</div>
        <h2>Unlock Premium Features</h2>
        <p>Get access to elite challenges, advanced analytics, and exclusive rewards.</p>
        
        <div class="p6-upgrade-options">
          <div class="p6-upgrade-option">
            <h3>Try Free for 30 Days</h3>
            <p>Full access to all premium features</p>
            <button class="btn-main p6-trial-btn">Start Trial</button>
          </div>
          
          <div class="p6-upgrade-option">
            <h3>Subscribe Now</h3>
            <p>Unlimited access for your child</p>
            <button class="btn-main p6-subscribe-btn">Subscribe</button>
          </div>
        </div>
        
        <button class="p6-close-btn">✕</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector(".p6-trial-btn").addEventListener("click", () => {
      activateTrial();
      modal.remove();
      document.dispatchEvent(new CustomEvent("phase6:trialStarted"));
    });

    modal.querySelector(".p6-subscribe-btn").addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("phase6:subscribeClicked"));
      // In production, this would redirect to payment
    });

    modal.querySelector(".p6-close-btn").addEventListener("click", () => {
      modal.remove();
    });

    console.log("[Phase 6.1] Upgrade CTA shown. Context:", context);
  } catch (err) {
    console.error("[Phase 6.1] Error showing upgrade CTA:", err);
  }
}

// ── BLUR LOCKED REWARDS ──
export function blurLockedRewards(container) {
  try {
    if (!container) return;

    const status = getSubscriptionStatus();
    if (status === "premium") return; // Don't blur for premium users

    // Find all reward elements
    const rewards = container.querySelectorAll("[data-reward-type='elite']");
    rewards.forEach((reward) => {
      reward.classList.add("p6-blurred");
      
      // Add unlock button
      const unlockBtn = document.createElement("button");
      unlockBtn.className = "p6-unlock-btn";
      unlockBtn.textContent = "🔒 Unlock";
      unlockBtn.addEventListener("click", () => showUpgradeCTA("reward"));
      reward.appendChild(unlockBtn);
    });

    console.log("[Phase 6.1] Blurred", rewards.length, "locked rewards");
  } catch (err) {
    console.error("[Phase 6.1] Error blurring locked rewards:", err);
  }
}

// ── PREVIEW TIMER CARD ──
export function renderPreviewTimerCard(container) {
  try {
    if (!container) return;

    const status = getSubscriptionStatus();
    if (status === "premium") return; // Don't show for premium users

    let timerHTML = "";
    let daysLeft = 0;

    if (status === "free") {
      daysLeft = getRemainingPreviewDays();
      if (daysLeft > 0) {
        timerHTML = `
          <div class="p6-preview-timer">
            <div class="p6-timer-icon">⏱️</div>
            <div class="p6-timer-content">
              <h3>Free Preview</h3>
              <p>${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining</p>
              <button class="btn-main p6-trial-btn-small">Try Premium Free</button>
            </div>
          </div>
        `;
      }
    } else if (status === "trial") {
      daysLeft = getRemainingTrialDays();
      if (daysLeft > 0) {
        timerHTML = `
          <div class="p6-trial-timer">
            <div class="p6-timer-icon">🎉</div>
            <div class="p6-timer-content">
              <h3>Premium Trial</h3>
              <p>${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining</p>
              <button class="btn-main p6-subscribe-btn-small">Subscribe Now</button>
            </div>
          </div>
        `;
      }
    }

    if (timerHTML) {
      container.innerHTML = timerHTML;

      // Wire button events
      const trialBtn = container.querySelector(".p6-trial-btn-small");
      if (trialBtn) {
        trialBtn.addEventListener("click", () => {
          activateTrial();
          renderPreviewTimerCard(container);
        });
      }

      const subscribeBtn = container.querySelector(".p6-subscribe-btn-small");
      if (subscribeBtn) {
        subscribeBtn.addEventListener("click", () => {
          document.dispatchEvent(new CustomEvent("phase6:subscribeClicked"));
        });
      }
    }
  } catch (err) {
    console.error("[Phase 6.1] Error rendering preview timer card:", err);
  }
}

// ── LOCK ARENA ELITE STAGES ──
export function lockArenaEliteStages(arenaState) {
  try {
    if (!arenaState) return arenaState;

    if (isPremiumFeature("elite_stage")) {
      // Mark elite stages as locked
      if (arenaState.stages) {
        arenaState.stages = arenaState.stages.map((stage) => {
          if (stage.type === "elite") {
            stage.locked = true;
            stage.lockReason = "Premium feature";
          }
          return stage;
        });
      }
    }

    return arenaState;
  } catch (err) {
    console.error("[Phase 6.1] Error locking arena elite stages:", err);
    return arenaState;
  }
}

// ── LOCK CAREER ELITE CHALLENGES ──
export function lockCareerEliteChallenges(careerData) {
  try {
    if (!careerData) return careerData;

    if (isPremiumFeature("elite_challenge")) {
      // Mark elite challenges as locked
      if (careerData.elite) {
        careerData.elite.locked = true;
        careerData.elite.lockReason = "Premium feature";
      }
    }

    return careerData;
  } catch (err) {
    console.error("[Phase 6.1] Error locking career elite challenges:", err);
    return careerData;
  }
}

// ── SHOW TRIAL OPTION ──
function showTrialOption() {
  try {
    const previewExpired = document.createElement("div");
    previewExpired.className = "p6-preview-expired";
    previewExpired.innerHTML = `
      <div class="p6-expired-content">
        <div class="p6-expired-icon">🎊</div>
        <h2>Preview Ended</h2>
        <p>You've completed the free preview! Try premium for 30 days free.</p>
        <button class="btn-main p6-trial-btn-large">Start 30-Day Trial</button>
      </div>
    `;

    document.body.appendChild(previewExpired);

    previewExpired.querySelector(".p6-trial-btn-large").addEventListener("click", () => {
      activateTrial();
      previewExpired.remove();
    });

    console.log("[Phase 6.1] Trial option shown after preview expiration");
  } catch (err) {
    console.error("[Phase 6.1] Error showing trial option:", err);
  }
}

console.log("[Phase 6.1] Subscription preview module loaded");
