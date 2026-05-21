/* ═══════════════════════════════════════════════════════════════
   PHASE 6.2 — PREMIUM PARENT DASHBOARD
   Revenue-driving analytics: heatmap, radar, intelligence, score
   Enhanced with storyteller narratives for trust-building UX
   ═══════════════════════════════════════════════════════════════ */

import {
  getWeeklyStory,
  getSkillStory,
  getConfidenceStory,
  getImprovementStory,
  getPremiumUnlockNarrative,
} from "./parent-insights-storyteller.js";

// ── STATE ──
let g_premium_dashboard_initialized = false;

// ── INIT ──
export function initPremiumParentDashboard() {
  if (g_premium_dashboard_initialized) return;
  g_premium_dashboard_initialized = true;

  try {
    console.log("[Phase 6.2] Premium parent dashboard initialized");
    document.dispatchEvent(new CustomEvent("phase6:premiumDashboardReady"));
  } catch (err) {
    console.error("[Phase 6.2] Error initializing premium dashboard:", err);
  }
}

// ── WEEKLY HEATMAP ──
export function renderWeeklyHeatmap(container) {
  try {
    if (!container) return;

    const heatmapData = getWeeklyHeatmapData();
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyStory = getWeeklyStory();

    let html = `
      <div class="p6-heatmap">
        <h3>Weekly Progress Heatmap</h3>
        
        <!-- Weekly Story Narrative -->
        <div class="p6-story-card p6-story-weekly">
          <div class="p6-story-header">
            <span class="p6-story-emoji">${weeklyStory.emoji}</span>
            <span class="p6-story-title">${weeklyStory.title}</span>
          </div>
          <p class="p6-story-narrative">${weeklyStory.narrative}</p>
          <div class="p6-story-metrics">
            <div class="p6-story-metric">
              <span class="p6-metric-label">Total Points</span>
              <span class="p6-metric-value">${weeklyStory.totalPoints}</span>
            </div>
            <div class="p6-story-metric">
              <span class="p6-metric-label">Activities</span>
              <span class="p6-metric-value">${weeklyStory.activities}</span>
            </div>
            <div class="p6-story-metric">
              <span class="p6-metric-label">Trend</span>
              <span class="p6-metric-value">${weeklyStory.trendEmoji}</span>
            </div>
          </div>
        </div>
        
        <!-- Heatmap Grid -->
        <div class="p6-heatmap-grid">
    `;

    days.forEach((day, idx) => {
      const data = heatmapData[idx] || { points: 0, simulations: 0 };
      const intensity = Math.min(100, (data.points / 100) * 100);
      const color = getHeatmapColor(intensity);

      html += `
        <div class="p6-heatmap-cell" style="background-color: ${color};" title="${day}: ${data.points} points, ${data.simulations} simulations">
          <div class="p6-heatmap-day">${day}</div>
          <div class="p6-heatmap-value">${data.points}</div>
        </div>
      `;
    });

    html += `
        </div>
        <div class="p6-heatmap-legend">
          <span>Less</span>
          <div class="p6-legend-gradient"></div>
          <span>More</span>
        </div>
      </div>
    `;

    container.innerHTML = html;
    console.log("[Phase 6.2] Weekly heatmap rendered");
  } catch (err) {
    console.error("[Phase 6.2] Error rendering weekly heatmap:", err);
  }
}

function getHeatmapColor(intensity) {
  if (intensity === 0) return "#f0f0f0";
  if (intensity < 25) return "#c6e48b";
  if (intensity < 50) return "#7bc96f";
  if (intensity < 75) return "#239a3b";
  return "#196127";
}

function getWeeklyHeatmapData() {
  try {
    const history = JSON.parse(localStorage.getItem("kl_weekly_history") || "[]");
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayData = history.find((h) => h.date === dateStr) || { points: 0, simulations: 0 };
      data.push(dayData);
    }

    return data;
  } catch (err) {
    console.error("[Phase 6.2] Error getting weekly heatmap data:", err);
    return Array(7).fill({ points: 0, simulations: 0 });
  }
}

// ── SKILL RADAR ──
export function renderSkillRadar(container) {
  try {
    if (!container) return;

    const radarData = getSkillRadarData();
    const skills = Object.keys(radarData);
    const skillStory = getSkillStory();

    let html = `
      <div class="p6-skill-radar">
        <h3>Skill Strength Radar</h3>
        
        <!-- Skill Story Narrative -->
        <div class="p6-story-card p6-story-skills">
          <div class="p6-story-header">
            <span class="p6-story-emoji">${skillStory.emoji}</span>
            <span class="p6-story-title">${skillStory.title}</span>
          </div>
          <p class="p6-story-narrative">${skillStory.narrative}</p>
          ${skillStory.skillsImproving.length > 0 ? `
            <div class="p6-story-improvements">
              <span class="p6-improvement-label">Improving:</span>
              ${skillStory.skillsImproving.map(s => `
                <span class="p6-improvement-badge">${s.career} +${s.improvement}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <!-- Radar SVG -->
        <svg class="p6-radar-svg" viewBox="0 0 200 200">
          <!-- Grid circles -->
          <circle cx="100" cy="100" r="30" class="p6-radar-grid" />
          <circle cx="100" cy="100" r="60" class="p6-radar-grid" />
          <circle cx="100" cy="100" r="90" class="p6-radar-grid" />
          
          <!-- Axes -->
    `;

    const angleSlice = (Math.PI * 2) / skills.length;
    skills.forEach((skill, idx) => {
      const angle = angleSlice * idx - Math.PI / 2;
      const x1 = 100 + 90 * Math.cos(angle);
      const y1 = 100 + 90 * Math.sin(angle);
      html += `<line x1="100" y1="100" x2="${x1}" y2="${y1}" class="p6-radar-axis" />`;
    });

    // Data polygon
    let polygonPoints = "";
    skills.forEach((skill, idx) => {
      const angle = angleSlice * idx - Math.PI / 2;
      const value = radarData[skill] || 0;
      const radius = (value / 100) * 90;
      const x = 100 + radius * Math.cos(angle);
      const y = 100 + radius * Math.sin(angle);
      polygonPoints += `${x},${y} `;
    });

    html += `
          <polygon points="${polygonPoints}" class="p6-radar-polygon" />
        </svg>
        
        <div class="p6-radar-legend">
    `;

    skills.forEach((skill) => {
      const value = radarData[skill] || 0;
      html += `
        <div class="p6-radar-item">
          <span class="p6-radar-label">${skill}</span>
          <div class="p6-radar-bar">
            <div class="p6-radar-fill" style="width: ${value}%"></div>
          </div>
          <span class="p6-radar-value">${value}%</span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
    console.log("[Phase 6.2] Skill radar rendered");
  } catch (err) {
    console.error("[Phase 6.2] Error rendering skill radar:", err);
  }
}

function getSkillRadarData() {
  try {
    const insights = JSON.parse(localStorage.getItem("kl_sim_insights") || "{}");
    const weakSkills = JSON.parse(localStorage.getItem("kl_weak_skills") || "[]");

    // Calculate skill strengths (inverse of weak skills)
    const skills = {
      "Decision Making": 85,
      "Time Management": 78,
      "Problem Solving": 92,
      "Communication": 88,
      "Teamwork": 75,
    };

    // Reduce scores for weak skills
    weakSkills.forEach((skill) => {
      if (skills[skill]) {
        skills[skill] = Math.max(20, skills[skill] - 15);
      }
    });

    return skills;
  } catch (err) {
    console.error("[Phase 6.2] Error getting skill radar data:", err);
    return {};
  }
}

// ── RETRY INTELLIGENCE ──
export function getRetryIntelligence() {
  try {
    const insights = JSON.parse(localStorage.getItem("kl_sim_insights") || "{}");
    const progress = JSON.parse(localStorage.getItem("kl_progress") || "{}");

    const totalAttempts = insights.attempt || 0;
    const totalRetries = insights.retry || 0;
    const retryRate = totalAttempts > 0 ? ((totalRetries / totalAttempts) * 100).toFixed(1) : 0;

    return {
      totalAttempts,
      totalRetries,
      retryRate,
      avgReactionTime: insights.reactionTime || 0,
      learningTrend: retryRate < 20 ? "improving" : retryRate < 40 ? "stable" : "needs_help",
    };
  } catch (err) {
    console.error("[Phase 6.2] Error getting retry intelligence:", err);
    return {
      totalAttempts: 0,
      totalRetries: 0,
      retryRate: 0,
      avgReactionTime: 0,
      learningTrend: "unknown",
    };
  }
}

export function renderRetryIntelligence(container) {
  try {
    if (!container) return;

    const intelligence = getRetryIntelligence();
    const improvementStory = getImprovementStory();

    const trendEmoji = {
      improving: "📈",
      stable: "➡️",
      needs_help: "📉",
    };

    const html = `
      <div class="p6-retry-intelligence">
        <h3>Learning Pattern Analysis</h3>
        
        <!-- Improvement Story Narrative -->
        <div class="p6-story-card p6-story-improvements">
          <div class="p6-story-header">
            <span class="p6-story-emoji">${improvementStory.emoji}</span>
            <span class="p6-story-title">${improvementStory.title}</span>
          </div>
          <p class="p6-story-narrative">${improvementStory.narrative}</p>
          ${improvementStory.improvements.length > 0 ? `
            <div class="p6-story-improvements-list">
              ${improvementStory.improvements.map(imp => `
                <div class="p6-improvement-item">
                  <span class="p6-improvement-badge">${imp.skill}</span>
                  <span class="p6-improvement-status">Improving ✓</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <!-- Intelligence Grid -->
        <div class="p6-intelligence-grid">
          <div class="p6-intelligence-card">
            <div class="p6-intelligence-label">Total Attempts</div>
            <div class="p6-intelligence-value">${intelligence.totalAttempts}</div>
          </div>
          <div class="p6-intelligence-card">
            <div class="p6-intelligence-label">Retry Rate</div>
            <div class="p6-intelligence-value">${intelligence.retryRate}%</div>
          </div>
          <div class="p6-intelligence-card">
            <div class="p6-intelligence-label">Avg Reaction Time</div>
            <div class="p6-intelligence-value">${intelligence.avgReactionTime}ms</div>
          </div>
          <div class="p6-intelligence-card">
            <div class="p6-intelligence-label">Learning Trend</div>
            <div class="p6-intelligence-value">${trendEmoji[intelligence.learningTrend]} ${intelligence.learningTrend}</div>
          </div>
        </div>
        <p class="p6-intelligence-insight">
          Your child is ${intelligence.learningTrend === "improving" ? "making great progress!" : intelligence.learningTrend === "stable" ? "maintaining steady progress." : "working through challenges. Consider additional practice."}
        </p>
      </div>
    `;

    container.innerHTML = html;
    console.log("[Phase 6.2] Retry intelligence rendered");
  } catch (err) {
    console.error("[Phase 6.2] Error rendering retry intelligence:", err);
  }
}

// ── CONFIDENCE GROWTH SCORE ──
export function getConfidenceGrowthScore() {
  try {
    const insights = JSON.parse(localStorage.getItem("kl_sim_insights") || "{}");
    const progress = JSON.parse(localStorage.getItem("kl_progress") || "{}");

    // Calculate confidence based on:
    // - Win rate (40%)
    // - Consistency (30%)
    // - Improvement trend (30%)

    const totalAttempts = insights.attempt || 0;
    const totalWins = insights.win || 0;
    const winRate = totalAttempts > 0 ? (totalWins / totalAttempts) * 100 : 0;

    const consistency = Math.min(100, (totalAttempts / 20) * 100); // Max at 20 attempts
    const improvement = Math.min(100, ((insights.reactionTime || 0) / 3000) * 100); // Faster = better

    const score = Math.round(winRate * 0.4 + consistency * 0.3 + improvement * 0.3);

    return Math.min(100, Math.max(0, score));
  } catch (err) {
    console.error("[Phase 6.2] Error calculating confidence score:", err);
    return 0;
  }
}

export function renderConfidenceScore(container) {
  try {
    if (!container) return;

    const score = getConfidenceGrowthScore();
    const level = score < 30 ? "Building" : score < 60 ? "Growing" : score < 85 ? "Strong" : "Excellent";
    const confidenceStory = getConfidenceStory();

    const html = `
      <div class="p6-confidence-score">
        <h3>Confidence Growth Score</h3>
        
        <!-- Confidence Story Narrative -->
        <div class="p6-story-card p6-story-confidence">
          <div class="p6-story-header">
            <span class="p6-story-emoji">${confidenceStory.emoji}</span>
            <span class="p6-story-title">${confidenceStory.title}</span>
          </div>
          <p class="p6-story-narrative">${confidenceStory.narrative}</p>
          <div class="p6-story-metrics">
            <div class="p6-story-metric">
              <span class="p6-metric-label">Win Rate</span>
              <span class="p6-metric-value">${confidenceStory.winRate}%</span>
            </div>
            <div class="p6-story-metric">
              <span class="p6-metric-label">Attempts</span>
              <span class="p6-metric-value">${confidenceStory.totalAttempts}</span>
            </div>
            <div class="p6-story-metric">
              <span class="p6-metric-label">Level</span>
              <span class="p6-metric-value">${confidenceStory.confidenceLevel}</span>
            </div>
          </div>
        </div>
        
        <!-- Gauge -->
        <div class="p6-score-gauge">
          <svg class="p6-gauge-svg" viewBox="0 0 200 120">
            <path d="M 20 100 A 80 80 0 0 1 180 100" class="p6-gauge-bg" />
            <path d="M 20 100 A 80 80 0 0 1 ${20 + (160 * score) / 100} 100" class="p6-gauge-fill" />
          </svg>
          <div class="p6-score-value">${score}</div>
        </div>
        <div class="p6-score-level">${level}</div>
        <p class="p6-score-description">
          Your child is showing ${level.toLowerCase()} confidence in problem-solving and decision-making.
        </p>
      </div>
    `;

    container.innerHTML = html;
    console.log("[Phase 6.2] Confidence score rendered");
  } catch (err) {
    console.error("[Phase 6.2] Error rendering confidence score:", err);
  }
}

// ── ACTIVITY RECOMMENDATIONS ──
export function getActivityRecommendations() {
  try {
    const weakSkills = JSON.parse(localStorage.getItem("kl_weak_skills") || "[]");
    const recommendations = [];

    const activityMap = {
      "Decision Making": {
        title: "Board Game Night",
        description: "Play strategy games like chess or Catan to practice decision-making",
        icon: "🎲",
      },
      "Time Management": {
        title: "Project Planning",
        description: "Help plan a small project with time estimates and deadlines",
        icon: "⏰",
      },
      "Problem Solving": {
        title: "Puzzle Challenge",
        description: "Solve puzzles or riddles together to build problem-solving skills",
        icon: "🧩",
      },
      "Communication": {
        title: "Presentation Practice",
        description: "Have your child present a topic they're interested in",
        icon: "🎤",
      },
      "Teamwork": {
        title: "Group Activity",
        description: "Participate in team sports or group projects",
        icon: "👥",
      },
    };

    weakSkills.slice(0, 3).forEach((skill) => {
      if (activityMap[skill]) {
        recommendations.push(activityMap[skill]);
      }
    });

    return recommendations;
  } catch (err) {
    console.error("[Phase 6.2] Error getting activity recommendations:", err);
    return [];
  }
}

export function renderActivityRecommendations(container) {
  try {
    if (!container) return;

    const recommendations = getActivityRecommendations();
    const skillStory = getSkillStory();

    let html = `
      <div class="p6-activity-recommendations">
        <h3>Real-World Activity Recommendations</h3>
        
        <!-- Skill Story Context -->
        <div class="p6-story-card p6-story-activities">
          <div class="p6-story-header">
            <span class="p6-story-emoji">${skillStory.emoji}</span>
            <span class="p6-story-title">Reinforce Learning</span>
          </div>
          <p class="p6-story-narrative">These activities help your child practice and reinforce the skills they're developing in Career Lab.</p>
        </div>
        
        <div class="p6-activity-grid">
    `;

    recommendations.forEach((activity) => {
      html += `
        <div class="p6-activity-card">
          <div class="p6-activity-icon">${activity.icon}</div>
          <h4>${activity.title}</h4>
          <p>${activity.description}</p>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
    console.log("[Phase 6.2] Activity recommendations rendered");
  } catch (err) {
    console.error("[Phase 6.2] Error rendering activity recommendations:", err);
  }
}

// ── SCHOOL READINESS PREVIEW ──
export function getSchoolReadinessPreview() {
  try {
    const confidence = getConfidenceGrowthScore();
    const intelligence = getRetryIntelligence();
    const radarData = getSkillRadarData();

    const readinessScore = Math.round(
      confidence * 0.4 + (100 - intelligence.retryRate) * 0.3 + Object.values(radarData).reduce((a, b) => a + b, 0) / Object.keys(radarData).length * 0.3
    );

    return {
      score: Math.min(100, Math.max(0, readinessScore)),
      level: readinessScore < 40 ? "Developing" : readinessScore < 70 ? "Ready" : "Advanced",
      strengths: Object.entries(radarData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map((e) => e[0]),
      areasForGrowth: Object.entries(radarData)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2)
        .map((e) => e[0]),
    };
  } catch (err) {
    console.error("[Phase 6.2] Error getting school readiness preview:", err);
    return {
      score: 0,
      level: "Unknown",
      strengths: [],
      areasForGrowth: [],
    };
  }
}

export function renderSchoolReadinessPreview(container) {
  try {
    if (!container) return;

    const readiness = getSchoolReadinessPreview();
    const improvementStory = getImprovementStory();

    let html = `
      <div class="p6-school-readiness">
        <h3>School Readiness Preview</h3>
        
        <!-- Readiness Story Narrative -->
        <div class="p6-story-card p6-story-readiness">
          <div class="p6-story-header">
            <span class="p6-story-emoji">🎓</span>
            <span class="p6-story-title">School Readiness</span>
          </div>
          <p class="p6-story-narrative">Your child is developing the skills needed for school success. This preview shows their readiness across key competencies.</p>
        </div>
        
        <div class="p6-readiness-score">
          <div class="p6-readiness-gauge">
            <div class="p6-readiness-fill" style="width: ${readiness.score}%"></div>
          </div>
          <div class="p6-readiness-value">${readiness.score}%</div>
          <div class="p6-readiness-level">${readiness.level}</div>
        </div>
        
        <div class="p6-readiness-details">
          <div class="p6-readiness-section">
            <h4>✓ Strengths</h4>
            <ul>
    `;

    readiness.strengths.forEach((strength) => {
      html += `<li><span class="p6-strength-badge">${strength}</span></li>`;
    });

    html += `
            </ul>
          </div>
          
          <div class="p6-readiness-section">
            <h4>→ Areas for Growth</h4>
            <ul>
    `;

    readiness.areasForGrowth.forEach((area) => {
      html += `<li><span class="p6-growth-badge">${area}</span></li>`;
    });

    html += `
            </ul>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    console.log("[Phase 6.2] School readiness preview rendered");
  } catch (err) {
    console.error("[Phase 6.2] Error rendering school readiness preview:", err);
  }
}

// ── SOFT LOCK OVERLAY ──
export function renderSoftLockOverlay(container) {
  try {
    if (!container) return;

    // Import subscription status checker (static import at top of file)
    // Using dynamic import would require async function
    // Instead, we'll check status directly via localStorage
    const status = localStorage.getItem("kl_subscription_status") || "free";

    // Only show soft lock for free users
    if (status === "premium" || status === "trial") {
      return; // Don't show soft lock for premium/trial users
    }

    // Create soft lock overlay
    const overlay = document.createElement("div");
    overlay.className = "p6-soft-lock-overlay p6-locked";

    const unlockNarrative = getPremiumUnlockNarrative();

    overlay.innerHTML = `
      <div class="p6-soft-lock-content">
        <div class="p6-soft-lock-icon">${unlockNarrative.emoji}</div>
        <h3>${unlockNarrative.title}</h3>
        <p class="p6-soft-lock-narrative">${unlockNarrative.narrative}</p>
        
        <div class="p6-soft-lock-benefits">
          ${unlockNarrative.benefits.map((benefit) => `
            <div class="p6-benefit-item">
              <span class="p6-benefit-icon">${benefit.split(" ")[0]}</span>
              <span class="p6-benefit-text">${benefit.substring(2)}</span>
            </div>
          `).join("")}
        </div>
        
        <button class="btn-main p6-unlock-cta">${unlockNarrative.cta}</button>
      </div>
    `;

    // Wire unlock button
    overlay.querySelector(".p6-unlock-cta").addEventListener("click", () => {
      // Dispatch event for upgrade CTA (will be handled by subscription-preview.js)
      document.dispatchEvent(new CustomEvent("phase6:premiumUnlockClicked", { detail: { context: "premium_analytics" } }));
    });

    // Apply soft lock to container
    container.style.position = "relative";
    container.appendChild(overlay);

    console.log("[Phase 6.2] Soft lock overlay rendered for free user");
  } catch (err) {
    console.error("[Phase 6.2] Error rendering soft lock overlay:", err);
  }
}

// ── MAIN DASHBOARD ORCHESTRATOR ──
export function renderParentInsightsV2(container) {
  try {
    if (!container) return;

    // Check subscription status
    const status = localStorage.getItem("kl_subscription_status") || "free";
    
    // Create dashboard wrapper
    const dashboard = document.createElement("div");
    dashboard.className = "p6-parent-insights-v2";
    
    // Create sections for each component
    const heatmapSection = document.createElement("div");
    heatmapSection.id = "p6-heatmap-section";
    
    const radarSection = document.createElement("div");
    radarSection.id = "p6-radar-section";
    
    const intelligenceSection = document.createElement("div");
    intelligenceSection.id = "p6-intelligence-section";
    
    const confidenceSection = document.createElement("div");
    confidenceSection.id = "p6-confidence-section";
    
    const activitiesSection = document.createElement("div");
    activitiesSection.id = "p6-activities-section";
    
    const readinessSection = document.createElement("div");
    readinessSection.id = "p6-readiness-section";
    
    // Append sections to dashboard
    dashboard.appendChild(heatmapSection);
    dashboard.appendChild(radarSection);
    dashboard.appendChild(intelligenceSection);
    dashboard.appendChild(confidenceSection);
    dashboard.appendChild(activitiesSection);
    dashboard.appendChild(readinessSection);
    
    // Clear container and add dashboard
    container.innerHTML = "";
    container.appendChild(dashboard);
    
    // Render all components
    renderWeeklyHeatmap(heatmapSection);
    renderSkillRadar(radarSection);
    renderRetryIntelligence(intelligenceSection);
    renderConfidenceScore(confidenceSection);
    renderActivityRecommendations(activitiesSection);
    renderSchoolReadinessPreview(readinessSection);
    
    // Apply soft lock overlay if free user
    if (status === "free") {
      renderSoftLockOverlay(dashboard);
    }
    
    console.log("[Phase 6.2] Parent insights v2 dashboard rendered. Status:", status);
    document.dispatchEvent(new CustomEvent("phase6:parentInsightsV2Ready"));
  } catch (err) {
    console.error("[Phase 6.2] Error rendering parent insights v2:", err);
  }
}

// ── PRINTABLE SNAPSHOT ──
export function generateProgressSnapshot() {
  try {
    const name = localStorage.getItem("kl_name") || "Child";
    const readiness = getSchoolReadinessPreview();
    const confidence = getConfidenceGrowthScore();
    const intelligence = getRetryIntelligence();

    const snapshot = `
Career Lab Progress Snapshot
Generated: ${new Date().toLocaleDateString()}

Child: ${name}

=== CONFIDENCE GROWTH ===
Score: ${confidence}/100
Level: ${readiness.level}

=== LEARNING PATTERNS ===
Total Attempts: ${intelligence.totalAttempts}
Retry Rate: ${intelligence.retryRate}%
Learning Trend: ${intelligence.learningTrend}

=== SKILL STRENGTHS ===
${readiness.strengths.map((s) => `• ${s}`).join("\n")}

=== AREAS FOR GROWTH ===
${readiness.areasForGrowth.map((a) => `• ${a}`).join("\n")}

=== SCHOOL READINESS ===
Overall Score: ${readiness.score}%
Level: ${readiness.level}

This snapshot was generated by Career Lab Premium Analytics.
    `;

    // Create downloadable file
    const blob = new Blob([snapshot], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `career-lab-snapshot-${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    console.log("[Phase 6.2] Progress snapshot generated and downloaded");
    document.dispatchEvent(new CustomEvent("phase6:snapshotGenerated"));
  } catch (err) {
    console.error("[Phase 6.2] Error generating progress snapshot:", err);
  }
}

console.log("[Phase 6.2] Premium parent dashboard module loaded");
