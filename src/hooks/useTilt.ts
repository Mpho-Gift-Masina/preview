import { useCallback, useRef, type PointerEvent } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Pointer-driven 3D tilt. Writes --rx/--ry (rotation) and --mx/--my (glare position)
 * as CSS variables on the element, so styling stays in CSS.
 */
export function useTilt<T extends HTMLElement>(maxDeg = 10) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  const onPointerMove = useCallback(
    (e: PointerEvent<T>) => {
      const el = ref.current;
      if (!el || reduced || e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${(x - 0.5) * 2 * maxDeg}deg`);
      el.style.setProperty('--rx', `${(0.5 - y) * 2 * maxDeg}deg`);
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
    },
    [maxDeg, reduced],
  );

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
