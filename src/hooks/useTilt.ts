import { useCallback, useRef } from 'react';
import type { PointerEvent } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * 3D tilt that follows the pointer. Writes --rx / --ry (degrees) and
 * --mx / --my (glare position, %) onto the element; CSS does the rest.
 */
export function useTilt<T extends HTMLElement>(maxDeg = 10) {
  const ref = useRef<T>(null);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  const onPointerMove = useCallback(
    (e: PointerEvent<T>) => {
      const el = ref.current;
      if (!el || reduced || e.pointerType === 'touch') return;
      const { clientX, clientY } = e;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (clientX - r.left) / r.width;
        const py = (clientY - r.top) / r.height;
        el.style.setProperty('--ry', `${(px - 0.5) * maxDeg * 2}deg`);
        el.style.setProperty('--rx', `${(0.5 - py) * maxDeg * 2}deg`);
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
      });
    },
    [maxDeg, reduced],
  );

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
