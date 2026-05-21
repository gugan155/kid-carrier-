/* Premium Ani Mouse Follow (extension layer on top of js/ani.js) */
import { $ } from "./utils.js";

const GESTURE_CLASSES = [
  "ani-excited",
  "ani-happy",
  "ani-think",
  "ani-wave",
  "ani-point",
  "ani-celebrate",
  "ani-nod",
  "ani-shake-head",
];

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Premium subtle head/face tracking.
 * - Uses rAF (not per-mouse-event updates).
 * - Applies rotation via WAAPI additive composite so gesture transforms remain intact.
 * - Smooth idle recovery when mouse stops or leaves window.
 */
export function initAniMouseFollow() {
  const char = $("ani-char");
  if (!char) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let haveMouse = false;
  let lastMoveTs = performance.now();

  // Target rotation (degrees)
  let tx = 0;
  let ty = 0;
  // Current rotation (degrees)
  let cx = 0;
  let cy = 0;

  // Single WAAPI animation we update each frame (additive transform)
  const anim = char.animate(
    [{ transform: "rotateX(0deg) rotateY(0deg)" }, { transform: "rotateX(0deg) rotateY(0deg)" }],
    { duration: 1000000, iterations: 1, fill: "both" }
  );
  // Additive compose (do not override existing gesture keyframes)
  try {
    // KeyframeEffect.composite is supported in modern Chromium.
    anim.effect.composite = "add";
  } catch {}

  const onMove = e => {
    mx = e.clientX;
    my = e.clientY;
    haveMouse = true;
    lastMoveTs = performance.now();
  };

  const onLeave = () => {
    haveMouse = false;
    lastMoveTs = performance.now();
  };

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseleave", onLeave, { passive: true });
  window.addEventListener("blur", onLeave, { passive: true });

  let rafId = 0;
  const tick = () => {
    rafId = requestAnimationFrame(tick);

    const now = performance.now();
    const idle = !haveMouse || now - lastMoveTs > 900;

    // Compute new target from mouse position (normalized to -1..1)
    if (idle) {
      tx = 0;
      ty = 0;
    } else {
      const nx = (mx / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (my / Math.max(1, window.innerHeight)) * 2 - 1;

      // Max ranges per spec: X ±6deg, Y ±8deg
      // RotateX should respond to vertical movement (invert so up = look up)
      tx = clamp(-ny * 6, -6, 6);
      ty = clamp(nx * 8, -8, 8);
    }

    // If a gesture animation is active, blend lightly instead of fighting it.
    const gesturing = GESTURE_CLASSES.some(c => char.classList.contains(c));
    const blend = gesturing ? 0.35 : 1.0;

    // Smooth interpolation (no snapping)
    const t = idle ? 0.08 : 0.12;
    cx = lerp(cx, tx * blend, t);
    cy = lerp(cy, ty * blend, t);

    // Apply as additive transform (update keyframes; 2 identical frames == constant)
    try {
      const tr = `rotateX(${cx.toFixed(3)}deg) rotateY(${cy.toFixed(3)}deg)`;
      anim.effect.setKeyframes([{ transform: tr }, { transform: tr }]);
    } catch {
      // If setKeyframes isn't supported, gracefully stop tracking.
      cancelAnimationFrame(rafId);
      try {
        anim.cancel();
      } catch {}
    }
  };

  tick();
}

