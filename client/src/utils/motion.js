// The site's motion language, in one place. Pick the speed by how important the moment is:
//   quick  (0.12 to 0.2 s)  press, hover, focus, toggles: the user is acting and needs an instant answer
//   medium (0.25 to 0.4 s)  opening and closing, tab highlights, dialogs
//   slow   (0.5 to 0.9 s)   moments worth noticing: first reveals, marks filling, numbers counting, a task done
// Springs are for things the user moves or toggles; fades use the eased tweens.
export const EASE = [0.23, 1, 0.32, 1];

export const TWEEN = {
  quick: { duration: 0.16, ease: EASE },
  medium: { duration: 0.3, ease: EASE },
  slow: { duration: 0.7, ease: EASE },
};

export const SPRING = {
  snappy: { type: "spring", stiffness: 420, damping: 34 }, // ticks, toggles
  smooth: { type: "spring", stiffness: 260, damping: 30 }, // highlights, panels
  soft: { type: "spring", stiffness: 120, damping: 22, mass: 1.1 }, // large fills and reveals, a small gentle overshoot
};

// The tick squeezes a little, then settles filled
export const TICK_SQUEEZE = [1, 0.8, 1.06, 1];
