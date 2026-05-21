/**
 * Phase 5.9 — Arena Visuals & Animations
 * Cinematic panels, layered scrolling, interactive elements,
 * micro-animations, and visual feedback.
 *
 * Exports: initArenaVisuals, highlightElement, showFeedback, 
 *          animatePanel, updateParallax
 * Storage: none (stateless)
 * Safe: pure ES module, additive only
 */

/**
 * Initialize arena visual system.
 * Sets up scroll listeners, parallax, and animation observers.
 */
export function initArenaVisuals() {
  try {
    // Setup parallax scroll listener
    setupParallaxScroll();

    // Setup intersection observer for lazy animations
    setupAnimationObserver();

    // Setup interactive element highlighting
    setupElementHighlighting();

    document.dispatchEvent(new CustomEvent("phase59:visualsReady"));
  } catch (e) {
    console.error("[Phase 5.9] Visuals init error:", e);
  }
}

/**
 * Setup parallax scroll effect.
 */
function setupParallaxScroll() {
  const container = document.getElementById("p59-arena-container");
  if (!container) return;

  container.addEventListener("scroll", () => {
    const scrollY = container.scrollTop;
    const layers = document.querySelectorAll(".p59-parallax-layer");

    layers.forEach(layer => {
      const depth = parseFloat(layer.style.getPropertyValue("--depth")) || 1;
      const offset = scrollY * (1 - depth) * 0.5;
      layer.style.transform = `translateY(${offset}px)`;
    });
  });
}

/**
 * Setup intersection observer for lazy animations.
 */
function setupAnimationObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("p59-animated");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  // Observe all animatable elements
  document.querySelectorAll(".p59-animate-on-view").forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Setup interactive element highlighting.
 */
function setupElementHighlighting() {
  document.addEventListener("mouseover", (e) => {
    if (e.target.classList.contains("p59-interactive")) {
      e.target.classList.add("p59-highlighted");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.classList.contains("p59-interactive")) {
      e.target.classList.remove("p59-highlighted");
    }
  });

  // Touch support
  document.addEventListener("touchstart", (e) => {
    if (e.target.classList.contains("p59-interactive")) {
      e.target.classList.add("p59-highlighted");
    }
  });

  document.addEventListener("touchend", (e) => {
    if (e.target.classList.contains("p59-interactive")) {
      e.target.classList.remove("p59-highlighted");
    }
  });
}

/**
 * Highlight an interactive element.
 * @param {HTMLElement} element - Element to highlight
 * @param {string} [style] - Highlight style (glow, bounce, ripple)
 */
export function highlightElement(element, style = "glow") {
  if (!element) return;

  element.classList.add("p59-interactive");
  element.classList.add(`p59-highlight-${style}`);

  // Auto-remove after animation
  setTimeout(() => {
    element.classList.remove(`p59-highlight-${style}`);
  }, 1000);
}

/**
 * Show visual feedback for action.
 * @param {string} type - Feedback type (correct, wrong, neutral)
 * @param {HTMLElement} [target] - Target element
 */
export function showFeedback(type, target) {
  try {
    const feedback = document.createElement("div");
    feedback.className = `p59-feedback p59-feedback-${type}`;
    
    const icons = {
      correct: "✅",
      wrong: "❌",
      neutral: "💭",
    };

    feedback.innerHTML = `
      <div class="p59-feedback-icon">${icons[type] || "•"}</div>
      <div class="p59-feedback-text">
        ${type === "correct" ? "Правильно!" : type === "wrong" ? "Не совсем..." : "Интересно!"}
      </div>
    `;

    if (target) {
      target.appendChild(feedback);
    } else {
      document.body.appendChild(feedback);
    }

    // Animate and remove
    feedback.classList.add("p59-feedback-show");
    setTimeout(() => {
      feedback.classList.remove("p59-feedback-show");
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
  } catch (e) {
    console.error("[Phase 5.9] Show feedback error:", e);
  }
}

/**
 * Animate panel entrance/exit.
 * @param {HTMLElement} panel - Panel element
 * @param {string} [direction] - Direction (in, out, left, right)
 */
export function animatePanel(panel, direction = "in") {
  if (!panel) return;

  const animations = {
    in: "p59-panel-enter",
    out: "p59-panel-exit",
    left: "p59-panel-slide-left",
    right: "p59-panel-slide-right",
  };

  const animClass = animations[direction] || animations.in;
  panel.classList.add(animClass);

  // Remove animation class after completion
  setTimeout(() => {
    panel.classList.remove(animClass);
  }, 600);
}

/**
 * Update parallax effect based on mouse position.
 * @param {MouseEvent} event - Mouse event
 */
export function updateParallax(event) {
  try {
    const container = document.getElementById("p59-arena-container");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const layers = document.querySelectorAll(".p59-parallax-layer");
    layers.forEach((layer) => {
      const depth = parseFloat(layer.style.getPropertyValue("--depth")) || 1;
      const offsetX = (xPercent - 50) * depth * 0.1;
      const offsetY = (yPercent - 50) * depth * 0.1;

      layer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  } catch (e) {
    console.error("[Phase 5.9] Update parallax error:", e);
  }
}

/**
 * Create floating animation for element.
 * @param {HTMLElement} element - Element to animate
 * @param {number} [duration] - Animation duration in ms
 */
export function createFloatingAnimation(element, duration = 3000) {
  if (!element) return;

  element.classList.add("p59-floating");
  element.style.setProperty("--float-duration", `${duration}ms`);
}

/**
 * Create pulse animation for element.
 * @param {HTMLElement} element - Element to animate
 * @param {number} [count] - Number of pulses
 */
export function createPulseAnimation(element, count = 3) {
  if (!element) return;

  element.classList.add("p59-pulsing");
  element.style.setProperty("--pulse-count", count);
}

/**
 * Create ripple effect at position.
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {HTMLElement} [container] - Container element
 */
export function createRippleEffect(x, y, container) {
  try {
    const ripple = document.createElement("div");
    ripple.className = "p59-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    if (container) {
      container.appendChild(ripple);
    } else {
      document.body.appendChild(ripple);
    }

    // Remove after animation
    setTimeout(() => ripple.remove(), 600);
  } catch (e) {
    console.error("[Phase 5.9] Create ripple error:", e);
  }
}

/**
 * Animate text reveal (character by character).
 * @param {HTMLElement} element - Element containing text
 * @param {number} [delay] - Delay between characters in ms
 */
export function animateTextReveal(element, delay = 50) {
  if (!element) return;

  const text = element.textContent;
  element.textContent = "";
  element.classList.add("p59-text-reveal");

  let charIdx = 0;
  const interval = setInterval(() => {
    if (charIdx < text.length) {
      element.textContent += text[charIdx];
      charIdx++;
    } else {
      clearInterval(interval);
    }
  }, delay);
}

/**
 * Create branching event highlight.
 * @param {HTMLElement} element - Event element
 */
export function highlightBranchingEvent(element) {
  if (!element) return;

  element.classList.add("p59-event-highlight");

  // Pulse animation
  createPulseAnimation(element, 2);

  // Remove highlight after 5 seconds
  setTimeout(() => {
    element.classList.remove("p59-event-highlight");
  }, 5000);
}

/**
 * Create success animation (confetti-like).
 * @param {HTMLElement} [container] - Container for animation
 */
export function createSuccessAnimation(container) {
  try {
    const success = document.createElement("div");
    success.className = "p59-success-burst";
    success.innerHTML = `
      <div class="p59-burst-particle">✨</div>
      <div class="p59-burst-particle">⭐</div>
      <div class="p59-burst-particle">🎉</div>
      <div class="p59-burst-particle">✨</div>
      <div class="p59-burst-particle">⭐</div>
    `;

    if (container) {
      container.appendChild(success);
    } else {
      document.body.appendChild(success);
    }

    // Remove after animation
    setTimeout(() => success.remove(), 1000);
  } catch (e) {
    console.error("[Phase 5.9] Create success animation error:", e);
  }
}
