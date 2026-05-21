/* ═══════════════════════════════════════════════════════════════
   PHASE 6.3 — MISSION ECONOMY SYSTEM
   Retention loop: wallet, inventory, cosmetics, streaks, rewards
   ═══════════════════════════════════════════════════════════════ */

// ── STATE ──
let g_mission_economy_initialized = false;

// ── INIT ──
export function initMissionEconomy() {
  if (g_mission_economy_initialized) return;
  g_mission_economy_initialized = true;

  try {
    // Initialize wallet if not exists
    if (!getWallet()) {
      setWallet({ coins: 0, gems: 0 });
    }

    // Initialize inventory if not exists
    if (!getInventory()) {
      setInventory({ accessories: [], aniUpgrades: [] });
    }

    // Initialize daily spin timestamp
    if (!getDailySpinTimestamp()) {
      setDailySpinTimestamp(new Date().toISOString().split("T")[0]);
    }

    // Initialize premium reward track
    if (!getPremiumRewardTrack()) {
      setPremiumRewardTrack({ level: 1, progress: 0, totalPoints: 0 });
    }

    console.log("[Phase 6.3] Mission economy initialized");
    document.dispatchEvent(new CustomEvent("phase6:missionEconomyReady"));
  } catch (err) {
    console.error("[Phase 6.3] Error initializing mission economy:", err);
  }
}

// ── WALLET MANAGEMENT ──
export function getWallet() {
  try {
    const wallet = localStorage.getItem("kl_wallet_coins");
    if (!wallet) return null;
    return JSON.parse(wallet);
  } catch (err) {
    console.error("[Phase 6.3] Error getting wallet:", err);
    return { coins: 0, gems: 0 };
  }
}

export function setWallet(wallet) {
  try {
    localStorage.setItem("kl_wallet_coins", JSON.stringify(wallet));
  } catch (err) {
    console.error("[Phase 6.3] Error setting wallet:", err);
  }
}

export function getCoins() {
  try {
    const wallet = getWallet();
    return wallet ? wallet.coins : 0;
  } catch (err) {
    console.error("[Phase 6.3] Error getting coins:", err);
    return 0;
  }
}

export function getGems() {
  try {
    const wallet = getWallet();
    return wallet ? wallet.gems : 0;
  } catch (err) {
    console.error("[Phase 6.3] Error getting gems:", err);
    return 0;
  }
}

export function awardCoins(amount, reason = "mission_complete") {
  try {
    const wallet = getWallet() || { coins: 0, gems: 0 };
    wallet.coins += amount;
    setWallet(wallet);

    console.log(`[Phase 6.3] Awarded ${amount} coins. Reason: ${reason}`);
    document.dispatchEvent(
      new CustomEvent("phase6:coinsAwarded", {
        detail: { amount, reason, totalCoins: wallet.coins },
      })
    );

    return wallet.coins;
  } catch (err) {
    console.error("[Phase 6.3] Error awarding coins:", err);
    return 0;
  }
}

export function spendCoins(amount, item) {
  try {
    const wallet = getWallet() || { coins: 0, gems: 0 };

    if (wallet.coins < amount) {
      console.warn("[Phase 6.3] Insufficient coins");
      return false;
    }

    wallet.coins -= amount;
    setWallet(wallet);

    console.log(`[Phase 6.3] Spent ${amount} coins on ${item}`);
    document.dispatchEvent(
      new CustomEvent("phase6:coinsSpent", {
        detail: { amount, item, remainingCoins: wallet.coins },
      })
    );

    return true;
  } catch (err) {
    console.error("[Phase 6.3] Error spending coins:", err);
    return false;
  }
}

export function awardGems(amount, reason = "premium_reward") {
  try {
    const wallet = getWallet() || { coins: 0, gems: 0 };
    wallet.gems += amount;
    setWallet(wallet);

    console.log(`[Phase 6.3] Awarded ${amount} gems. Reason: ${reason}`);
    document.dispatchEvent(
      new CustomEvent("phase6:gemsAwarded", {
        detail: { amount, reason, totalGems: wallet.gems },
      })
    );

    return wallet.gems;
  } catch (err) {
    console.error("[Phase 6.3] Error awarding gems:", err);
    return 0;
  }
}

// ── INVENTORY MANAGEMENT ──
export function getInventory() {
  try {
    const inventory = localStorage.getItem("kl_inventory_accessories");
    if (!inventory) return null;
    return JSON.parse(inventory);
  } catch (err) {
    console.error("[Phase 6.3] Error getting inventory:", err);
    return { accessories: [], aniUpgrades: [] };
  }
}

export function setInventory(inventory) {
  try {
    localStorage.setItem("kl_inventory_accessories", JSON.stringify(inventory));
  } catch (err) {
    console.error("[Phase 6.3] Error setting inventory:", err);
  }
}

export function unlockAccessory(accessoryId) {
  try {
    const inventory = getInventory() || { accessories: [], aniUpgrades: [] };

    if (!inventory.accessories.includes(accessoryId)) {
      inventory.accessories.push(accessoryId);
      setInventory(inventory);

      console.log(`[Phase 6.3] Unlocked accessory: ${accessoryId}`);
      document.dispatchEvent(
        new CustomEvent("phase6:accessoryUnlocked", {
          detail: { accessoryId },
        })
      );

      return true;
    }

    return false;
  } catch (err) {
    console.error("[Phase 6.3] Error unlocking accessory:", err);
    return false;
  }
}

export function equipAccessory(accessoryId) {
  try {
    const inventory = getInventory() || { accessories: [], aniUpgrades: [] };

    if (inventory.accessories.includes(accessoryId)) {
      localStorage.setItem("kl_equipped_accessory", accessoryId);

      console.log(`[Phase 6.3] Equipped accessory: ${accessoryId}`);
      document.dispatchEvent(
        new CustomEvent("phase6:accessoryEquipped", {
          detail: { accessoryId },
        })
      );

      return true;
    }

    return false;
  } catch (err) {
    console.error("[Phase 6.3] Error equipping accessory:", err);
    return false;
  }
}

export function getEquippedAccessory() {
  try {
    return localStorage.getItem("kl_equipped_accessory") || null;
  } catch (err) {
    console.error("[Phase 6.3] Error getting equipped accessory:", err);
    return null;
  }
}

// ── ANI COSMETICS ──
export function upgradeAni(upgradeId) {
  try {
    const inventory = getInventory() || { accessories: [], aniUpgrades: [] };

    if (!inventory.aniUpgrades.includes(upgradeId)) {
      inventory.aniUpgrades.push(upgradeId);
      setInventory(inventory);

      console.log(`[Phase 6.3] Upgraded Ani: ${upgradeId}`);
      document.dispatchEvent(
        new CustomEvent("phase6:aniUpgraded", {
          detail: { upgradeId },
        })
      );

      return true;
    }

    return false;
  } catch (err) {
    console.error("[Phase 6.3] Error upgrading Ani:", err);
    return false;
  }
}

export function getAniUpgrades() {
  try {
    const inventory = getInventory() || { accessories: [], aniUpgrades: [] };
    return inventory.aniUpgrades || [];
  } catch (err) {
    console.error("[Phase 6.3] Error getting Ani upgrades:", err);
    return [];
  }
}

// ── STREAK BOOSTER ──
export function getStreakBooster() {
  try {
    const booster = localStorage.getItem("kl_streak_booster");
    return booster ? parseFloat(booster) : 1.0;
  } catch (err) {
    console.error("[Phase 6.3] Error getting streak booster:", err);
    return 1.0;
  }
}

export function setStreakBooster(multiplier) {
  try {
    localStorage.setItem("kl_streak_booster", multiplier.toString());
  } catch (err) {
    console.error("[Phase 6.3] Error setting streak booster:", err);
  }
}

export function incrementStreak() {
  try {
    let booster = getStreakBooster();
    booster = Math.min(2.0, booster + 0.1); // Max 2.0x
    setStreakBooster(booster);

    console.log(`[Phase 6.3] Streak booster increased to ${booster.toFixed(1)}x`);
    document.dispatchEvent(
      new CustomEvent("phase6:streakIncremented", {
        detail: { booster },
      })
    );

    return booster;
  } catch (err) {
    console.error("[Phase 6.3] Error incrementing streak:", err);
    return 1.0;
  }
}

export function resetStreak() {
  try {
    setStreakBooster(1.0);
    console.log("[Phase 6.3] Streak booster reset to 1.0x");
    document.dispatchEvent(new CustomEvent("phase6:streakReset"));
  } catch (err) {
    console.error("[Phase 6.3] Error resetting streak:", err);
  }
}

// ── DAILY SPIN ──
export function getDailySpinTimestamp() {
  try {
    return localStorage.getItem("kl_daily_spin_timestamp");
  } catch (err) {
    console.error("[Phase 6.3] Error getting daily spin timestamp:", err);
    return null;
  }
}

export function setDailySpinTimestamp(date) {
  try {
    localStorage.setItem("kl_daily_spin_timestamp", date);
  } catch (err) {
    console.error("[Phase 6.3] Error setting daily spin timestamp:", err);
  }
}

export function canSpinToday() {
  try {
    const lastSpin = getDailySpinTimestamp();
    const today = new Date().toISOString().split("T")[0];
    return lastSpin !== today;
  } catch (err) {
    console.error("[Phase 6.3] Error checking if can spin today:", err);
    return false;
  }
}

export function spinDailyReward() {
  try {
    if (!canSpinToday()) {
      console.warn("[Phase 6.3] Already spun today");
      return null;
    }

    const rewards = [
      { type: "coins", amount: 50, label: "50 Coins" },
      { type: "coins", amount: 100, label: "100 Coins" },
      { type: "coins", amount: 150, label: "150 Coins" },
      { type: "gems", amount: 5, label: "5 Gems" },
      { type: "gems", amount: 10, label: "10 Gems" },
      { type: "booster", amount: 0.2, label: "Streak +0.2x" },
      { type: "accessory", amount: "hat_1", label: "Hat Accessory" },
    ];

    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    // Apply reward
    if (reward.type === "coins") {
      awardCoins(reward.amount, "daily_spin");
    } else if (reward.type === "gems") {
      awardGems(reward.amount, "daily_spin");
    } else if (reward.type === "booster") {
      incrementStreak();
    } else if (reward.type === "accessory") {
      unlockAccessory(reward.amount);
    }

    // Update timestamp
    setDailySpinTimestamp(new Date().toISOString().split("T")[0]);

    console.log(`[Phase 6.3] Daily spin result: ${reward.label}`);
    document.dispatchEvent(
      new CustomEvent("phase6:dailySpinResult", {
        detail: { reward },
      })
    );

    return reward;
  } catch (err) {
    console.error("[Phase 6.3] Error spinning daily reward:", err);
    return null;
  }
}

// ── PREMIUM REWARD TRACK ──
export function getPremiumRewardTrack() {
  try {
    const track = localStorage.getItem("kl_premium_reward_track");
    if (!track) return null;
    return JSON.parse(track);
  } catch (err) {
    console.error("[Phase 6.3] Error getting premium reward track:", err);
    return { level: 1, progress: 0, totalPoints: 0 };
  }
}

export function setPremiumRewardTrack(track) {
  try {
    localStorage.setItem("kl_premium_reward_track", JSON.stringify(track));
  } catch (err) {
    console.error("[Phase 6.3] Error setting premium reward track:", err);
  }
}

export function awardPremiumPoints(points) {
  try {
    const track = getPremiumRewardTrack() || { level: 1, progress: 0, totalPoints: 0 };
    track.totalPoints += points;
    track.progress += points;

    // Check for level up (100 points per level)
    const pointsPerLevel = 100;
    while (track.progress >= pointsPerLevel) {
      track.level += 1;
      track.progress -= pointsPerLevel;

      console.log(`[Phase 6.3] Premium track level up! Level ${track.level}`);
      document.dispatchEvent(
        new CustomEvent("phase6:premiumLevelUp", {
          detail: { level: track.level },
        })
      );

      // Award reward for level up
      awardGems(5, "premium_level_up");
    }

    setPremiumRewardTrack(track);

    console.log(`[Phase 6.3] Awarded ${points} premium points`);
    document.dispatchEvent(
      new CustomEvent("phase6:premiumPointsAwarded", {
        detail: { points, track },
      })
    );

    return track;
  } catch (err) {
    console.error("[Phase 6.3] Error awarding premium points:", err);
    return null;
  }
}

// ── REWARD CALCULATION ──
export function calculateMissionReward(baseCoins, difficulty = "medium") {
  try {
    // Base coins
    let coins = baseCoins;

    // Difficulty multiplier
    const difficultyMultipliers = {
      easy: 1.0,
      medium: 1.5,
      pro: 2.0,
    };
    coins *= difficultyMultipliers[difficulty] || 1.0;

    // Streak booster
    const booster = getStreakBooster();
    coins *= booster;

    // Round to nearest 5
    coins = Math.round(coins / 5) * 5;

    return coins;
  } catch (err) {
    console.error("[Phase 6.3] Error calculating mission reward:", err);
    return baseCoins;
  }
}

// ── WALLET DISPLAY ──
export function renderWalletDisplay(container) {
  try {
    if (!container) return;

    const coins = getCoins();
    const gems = getGems();

    const html = `
      <div class="p6-wallet-display">
        <div class="p6-wallet-item">
          <span class="p6-wallet-icon">🪙</span>
          <span class="p6-wallet-amount">${coins}</span>
        </div>
        <div class="p6-wallet-item">
          <span class="p6-wallet-icon">💎</span>
          <span class="p6-wallet-amount">${gems}</span>
        </div>
      </div>
    `;

    container.innerHTML = html;
    console.log("[Phase 6.3] Wallet display rendered");
  } catch (err) {
    console.error("[Phase 6.3] Error rendering wallet display:", err);
  }
}

// ── INVENTORY DISPLAY ──
export function renderInventoryPanel(container) {
  try {
    if (!container) return;

    const inventory = getInventory() || { accessories: [], aniUpgrades: [] };
    const equipped = getEquippedAccessory();

    let html = `
      <div class="p6-inventory-panel">
        <h3>Inventory</h3>
        
        <div class="p6-inventory-section">
          <h4>Accessories (${inventory.accessories.length})</h4>
          <div class="p6-inventory-grid">
    `;

    const accessoryNames = {
      hat_1: "🎩 Top Hat",
      hat_2: "👒 Sun Hat",
      glasses_1: "🕶️ Cool Shades",
      glasses_2: "👓 Nerdy Glasses",
      scarf_1: "🧣 Red Scarf",
      scarf_2: "🧣 Blue Scarf",
    };

    inventory.accessories.forEach((accessoryId) => {
      const isEquipped = equipped === accessoryId;
      html += `
        <div class="p6-inventory-item ${isEquipped ? "equipped" : ""}">
          <div class="p6-item-name">${accessoryNames[accessoryId] || accessoryId}</div>
          <button class="p6-equip-btn" data-accessory="${accessoryId}">
            ${isEquipped ? "✓ Equipped" : "Equip"}
          </button>
        </div>
      `;
    });

    html += `
          </div>
        </div>
        
        <div class="p6-inventory-section">
          <h4>Ani Upgrades (${inventory.aniUpgrades.length})</h4>
          <div class="p6-upgrades-list">
    `;

    const upgradeNames = {
      ani_glow: "✨ Glow Effect",
      ani_sparkle: "💫 Sparkle",
      ani_rainbow: "🌈 Rainbow",
      ani_dance: "💃 Dance Moves",
    };

    inventory.aniUpgrades.forEach((upgradeId) => {
      html += `<div class="p6-upgrade-item">✓ ${upgradeNames[upgradeId] || upgradeId}</div>`;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Wire equip buttons
    container.querySelectorAll(".p6-equip-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const accessoryId = btn.dataset.accessory;
        equipAccessory(accessoryId);
        renderInventoryPanel(container);
      });
    });

    console.log("[Phase 6.3] Inventory panel rendered");
  } catch (err) {
    console.error("[Phase 6.3] Error rendering inventory panel:", err);
  }
}

// ── DAILY SPIN WHEEL ──
export function renderDailySpinWheel(container) {
  try {
    if (!container) return;

    const canSpin = canSpinToday();

    const html = `
      <div class="p6-daily-spin">
        <h3>Daily Reward Spin</h3>
        <div class="p6-spin-wheel">
          <div class="p6-spin-pointer">▼</div>
          <div class="p6-spin-circle">
            <div class="p6-spin-segment" style="--segment: 0">50 🪙</div>
            <div class="p6-spin-segment" style="--segment: 1">100 🪙</div>
            <div class="p6-spin-segment" style="--segment: 2">150 🪙</div>
            <div class="p6-spin-segment" style="--segment: 3">5 💎</div>
            <div class="p6-spin-segment" style="--segment: 4">10 💎</div>
            <div class="p6-spin-segment" style="--segment: 5">+0.2x 🔥</div>
            <div class="p6-spin-segment" style="--segment: 6">🎁 Item</div>
          </div>
        </div>
        <button class="btn-main p6-spin-btn" ${!canSpin ? "disabled" : ""}>
          ${canSpin ? "Spin Now!" : "Come Back Tomorrow"}
        </button>
      </div>
    `;

    container.innerHTML = html;

    if (canSpin) {
      container.querySelector(".p6-spin-btn").addEventListener("click", () => {
        const reward = spinDailyReward();
        if (reward) {
          alert(`You won: ${reward.label}!`);
          renderDailySpinWheel(container);
        }
      });
    }

    console.log("[Phase 6.3] Daily spin wheel rendered");
  } catch (err) {
    console.error("[Phase 6.3] Error rendering daily spin wheel:", err);
  }
}

console.log("[Phase 6.3] Mission economy module loaded");
