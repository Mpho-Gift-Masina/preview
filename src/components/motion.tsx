import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

/* ---------- Timing ---------- */

/** Soft ease-out used by the scroll reveals (smooth start, gentle landing). */
export const smooth = [0.25, 0.46, 0.45, 0.94] as const;
/** Longer, springier ease-out for bigger moves (modals, story, carousel). */
export const ease = [0.22, 1, 0.36, 1] as const;
/** Symmetric ease for curtains and exits. */
export const easeInOut = [0.76, 0, 0.24, 1] as const;

/* ---------- Scroll-reveal presets ---------- */

/**
 * When a reveal fires: once the element is 80px inside the screen.
 * `once: false` replays the animation every time you scroll back to it.
 */
export const inView = { once: false, margin: '-80px' } as const;

/** Spread onto a motion element to make it animate from "hidden" to "show" as it scrolls into view. */
export const reveal = { initial: 'hidden', whileInView: 'show', viewport: inView } as const;

/** Rise 28px while fading in. The default reveal for text and cards. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: smooth } },
};

/** Slide in from the right. Used for images beside text. */
export const slideIn: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: smooth } },
};

/** Parent that reveals its children one after another (0.2s apart). */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

/** Same as `stagger`, but quicker (0.07s apart) for long lists and grids. */
export const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/* ---------- Helpers ---------- */

interface RevealProps {
  children: ReactNode;
  className?: string;
}

/** A div that fades up when scrolled into view. */
export function Reveal({ children, className }: RevealProps) {
  return (
    <motion.div className={className} variants={fadeUp} {...reveal}>
      {children}
    </motion.div>
  );
}

/**
 * SVG filters behind the liquid effects:
 * - `#liquid-glass` bends whatever sits behind a glass panel (Chromium shows it; other browsers fall back to plain frosted glass).
 * - `#liquid-btn` does the same, more gently, for buttons.
 * - `#goo` melts overlapping blobs together like liquid.
 */
export function LiquidFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="liquid-glass" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="5" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
        <feDisplacementMap in="SourceGraphic" in2="soft" scale="28" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {/* Gentler version of #liquid-glass for small things like buttons. */}
      <filter id="liquid-btn" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="2" seed="11" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="1.5" result="soft" />
        <feDisplacementMap in="SourceGraphic" in2="soft" scale="14" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="goo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
        <feBlend in="SourceGraphic" in2="goo" />
      </filter>
    </svg>
  );
}
