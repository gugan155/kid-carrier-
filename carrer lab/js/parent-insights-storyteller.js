/**
 * Parent Insights Storyteller — UX Interpretation Layer
 * Converts raw data into human-readable narratives for trust-building
 * 
 * Purpose: Transform data-heavy analytics into engaging stories that:
 * - Show "what child learned" in simple language
 * - Build parent confidence and trust
 * - Highlight progress and improvements
 * - Create emotional connection to premium features
 * 
 * Exports: getWeeklyStory, getSkillStory, getConfidenceStory, getImprovementStory
 * Safe: Pure interpretation layer, no data modification
 */

/**
 * Generate weekly story summary
 * Converts raw weekly growth data into narrative
 * @returns {object} Story with title, narrative, emoji, and key metrics
 */
export function getWeeklyStory() {
  try {
    const insights = JSON.parse(localStorage.getItem("kl_parent_insights_v2") || "{}");
    const weeklyGrowth = insights.weeklyGrowth || [];
    
    if (weeklyGrowth.length === 0) {
      return {
        title: "Ready to Start",
        narrative: "Your child hasn't started any missions yet. Encourage them to begin their first simulation!",
        emoji: "🚀",
        totalPoints: 0,
        activities: 0,
        trend: "starting",
      };
    }

    // Get last 7 days
    const lastWeek = weeklyGrowth.slice(-7);
    const totalPoints = lastWeek.reduce((sum, day) => sum + (day.points || 0), 0);
    const totalActivities = lastWeek.reduce((sum, day) => sum + (day.activities || 0), 0);
    
    // Calculate trend
    const firstHalf = lastWeek.slice(0, 3).reduce((sum, day) => sum + (day.points || 0), 0);
    const secondHalf = lastWeek.slice(4).reduce((sum, day) => sum + (day.points || 0), 0);
    const trend = secondHalf > firstHalf ? "improving" : secondHalf < firstHalf ? "declining" : "stable";

    // Generate narrative based on performance
    let narrative = "";
    let emoji = "";

    if (totalPoints > 500) {
      narrative = `🌟 Wow! Your child earned ${totalPoints} points this week across ${totalActivities} missions. That's incredible dedication and growth!`;
      emoji = "🌟";
    } else if (totalPoints > 300) {
      narrative = `✨ Great week! Your child completed ${totalActivities} missions and earned ${totalPoints} points. They're building strong skills!`;
      emoji = "✨";
    } else if (totalPoints > 100) {
      narrative = `📈 Good progress! Your child earned ${totalPoints} points this week. Keep encouraging them to explore more careers!`;
      emoji = "📈";
    } else if (totalPoints > 0) {
      narrative = `🌱 Your child is getting started! They've earned ${totalPoints} points. Every mission builds confidence!`;
      emoji = "🌱";
    } else {
      narrative = "No activity this week. Encourage your child to try a new simulation!";
      emoji = "💭";
    }

    return {
      title: "This Week's Journey",
      narrative,
      emoji,
      totalPoints,
      activities: totalActivities,
      trend,
      trendEmoji: trend === "improving" ? "📈" : trend === "declining" ? "📉" : "➡️",
    };
  } catch (e) {
    console.error("[Storyteller] Error generating weekly story:", e);
    return {
      title: "Weekly Progress",
      narrative: "Track your child's progress over time.",
      emoji: "📊",
      totalPoints: 0,
      activities: 0,
      trend: "unknown",
    };
  }
}

/**
 * Generate skill improvement story
 * Shows what specific skills child improved in
 * @returns {object} Story with skills learned and narrative
 */
export function getSkillStory() {
  try {
    const insights = JSON.parse(localStorage.getItem("kl_parent_insights_v2") || "{}");
    const careerPerformance = insights.careerPerformance || {};
    const weakSkills = insights.weakSkillTimeline || [];

    if (Object.keys(careerPerformance).length === 0) {
      return {
        title: "Skills to Discover",
        narrative: "Your child will develop skills across decision-making, time management, problem-solving, and more!",
        emoji: "🎯",
        skillsLearned: [],
        skillsImproving: [],
      };
    }

    // Find careers with improvement
    const skillsLearned = [];
    const skillsImproving = [];

    Object.entries(careerPerformance).forEach(([career, stats]) => {
      if (stats.trend && stats.trend.length > 1) {
        const recent = stats.trend[stats.trend.length - 1];
        const previous = stats.trend[stats.trend.length - 2];
        
        if (recent > previous) {
          skillsImproving.push({
            career,
            improvement: recent - previous,
            score: recent,
          });
        }
      }
      
      if (stats.avgScore > 70) {
        skillsLearned.push({
          career,
          score: stats.avgScore,
        });
      }
    });

    // Sort by improvement
    skillsImproving.sort((a, b) => b.improvement - a.improvement);

    let narrative = "";
    if (skillsImproving.length > 0) {
      const topSkill = skillsImproving[0];
      narrative = `🎓 Your child is improving in ${topSkill.career}! Their score increased by ${topSkill.improvement} points. Keep encouraging this growth!`;
    } else if (skillsLearned.length > 0) {
      narrative = `💪 Your child has developed strong skills in ${skillsLearned[0].career}. They're building a solid foundation!`;
    } else {
      narrative = "Your child is exploring different careers and building diverse skills.";
    }

    return {
      title: "Skills Your Child is Developing",
      narrative,
      emoji: "🎓",
      skillsLearned: skillsLearned.slice(0, 3),
      skillsImproving: skillsImproving.slice(0, 3),
    };
  } catch (e) {
    console.error("[Storyteller] Error generating skill story:", e);
    return {
      title: "Skills Development",
      narrative: "Your child is building valuable career skills.",
      emoji: "🎯",
      skillsLearned: [],
      skillsImproving: [],
    };
  }
}

/**
 * Generate confidence growth story
 * Shows how child's confidence is building
 * @returns {object} Story with confidence narrative and metrics
 */
export function getConfidenceStory() {
  try {
    const insights = JSON.parse(localStorage.getItem("kl_parent_insights_v2") || "{}");
    const careerPerformance = insights.careerPerformance || {};

    if (Object.keys(careerPerformance).length === 0) {
      return {
        title: "Building Confidence",
        narrative: "Your child's confidence will grow with each mission they complete.",
        emoji: "💪",
        confidenceLevel: "Starting",
        message: "Encourage them to try their first simulation!",
      };
    }

    // Calculate overall win rate
    let totalAttempts = 0;
    let totalWins = 0;

    Object.values(careerPerformance).forEach((stats) => {
      totalAttempts += stats.attempts || 0;
      totalWins += stats.wins || 0;
    });

    const winRate = totalAttempts > 0 ? Math.round((totalWins / totalAttempts) * 100) : 0;

    let confidenceLevel = "Building";
    let message = "";
    let emoji = "";

    if (winRate >= 80) {
      confidenceLevel = "Excellent";
      message = `Your child is winning ${winRate}% of their missions! They're showing remarkable confidence and skill.`;
      emoji = "🏆";
    } else if (winRate >= 60) {
      confidenceLevel = "Strong";
      message = `Your child is winning ${winRate}% of their missions. They're building real confidence in their abilities!`;
      emoji = "⭐";
    } else if (winRate >= 40) {
      confidenceLevel = "Growing";
      message = `Your child is winning ${winRate}% of their missions. Each attempt builds their confidence!`;
      emoji = "📈";
    } else if (winRate >= 20) {
      confidenceLevel = "Developing";
      message = `Your child is learning and growing. With ${winRate}% wins, they're on the right track!`;
      emoji = "🌱";
    } else {
      confidenceLevel = "Starting";
      message = "Your child is just beginning. Encourage them—every attempt builds confidence!";
      emoji = "🚀";
    }

    return {
      title: "Confidence Growth",
      narrative: message,
      emoji,
      confidenceLevel,
      winRate,
      totalAttempts,
      totalWins,
    };
  } catch (e) {
    console.error("[Storyteller] Error generating confidence story:", e);
    return {
      title: "Confidence Building",
      narrative: "Your child's confidence grows with each mission.",
      emoji: "💪",
      confidenceLevel: "Unknown",
      message: "Track progress over time.",
    };
  }
}

/**
 * Generate improvement trend story
 * Shows specific improvements in weak areas
 * @returns {object} Story with improvement narrative
 */
export function getImprovementStory() {
  try {
    const insights = JSON.parse(localStorage.getItem("kl_parent_insights_v2") || "{}");
    const weakSkillTimeline = insights.weakSkillTimeline || [];

    if (weakSkillTimeline.length === 0) {
      return {
        title: "No Weak Areas",
        narrative: "Your child is performing well across all skills! Keep up the great work!",
        emoji: "✨",
        improvements: [],
        message: "Your child is excelling!",
      };
    }

    // Find skills that have improved (fewer recent errors)
    const improvements = [];
    const topWeakSkills = weakSkillTimeline.slice(0, 3);

    topWeakSkills.forEach((skill) => {
      const daysAgo = Math.floor((Date.now() - skill.timestamp) / (1000 * 60 * 60 * 24));
      
      if (daysAgo > 3 && skill.count < 3) {
        improvements.push({
          skill: skill.skill,
          errorCount: skill.count,
          daysAgo,
          status: "improving",
        });
      }
    });

    let narrative = "";
    let emoji = "";

    if (improvements.length > 0) {
      const topImprovement = improvements[0];
      narrative = `🌟 Great news! Your child is improving in ${topImprovement.skill}. They've reduced errors and are building mastery!`;
      emoji = "🌟";
    } else if (topWeakSkills.length > 0) {
      const topSkill = topWeakSkills[0];
      narrative = `💡 Your child is working on ${topSkill.skill}. With practice, they'll master this skill soon!`;
      emoji = "💡";
    } else {
      narrative = "Your child is making steady progress across all areas!";
      emoji = "📈";
    }

    return {
      title: "Areas of Growth",
      narrative,
      emoji,
      improvements,
      topWeakSkills: topWeakSkills.slice(0, 2),
      message: "Every challenge is an opportunity to learn!",
    };
  } catch (e) {
    console.error("[Storyteller] Error generating improvement story:", e);
    return {
      title: "Growth Opportunities",
      narrative: "Your child is learning and improving.",
      emoji: "📈",
      improvements: [],
      message: "Track progress over time.",
    };
  }
}

/**
 * Generate premium unlock narrative
 * Creates compelling reason to unlock premium features
 * @returns {object} Unlock narrative with benefits
 */
export function getPremiumUnlockNarrative() {
  try {
    const weeklyStory = getWeeklyStory();
    const skillStory = getSkillStory();
    const confidenceStory = getConfidenceStory();

    const benefits = [
      "📊 Weekly heatmap showing exactly when your child is most engaged",
      "🎯 Skill radar revealing strengths and growth areas at a glance",
      "📈 Learning pattern analysis to understand how your child learns best",
      "💪 Confidence growth tracking with personalized recommendations",
      "🎓 Real-world activity suggestions to reinforce learning",
      "📋 Printable progress reports to share with teachers",
    ];

    const narrative = `
Your child is ${confidenceStory.confidenceLevel.toLowerCase()} confidence and developing amazing skills. 
With Premium Analytics, you'll unlock deeper insights into their learning journey and get personalized 
recommendations to support their growth.
    `.trim();

    return {
      title: "Unlock Deeper Insights",
      narrative,
      benefits,
      emoji: "🔓",
      cta: "Unlock Premium Analytics",
    };
  } catch (e) {
    console.error("[Storyteller] Error generating premium unlock narrative:", e);
    return {
      title: "Premium Analytics",
      narrative: "Get deeper insights into your child's learning journey.",
      benefits: [],
      emoji: "🔓",
      cta: "Learn More",
    };
  }
}

console.log("[Storyteller] Parent insights storyteller module loaded");
