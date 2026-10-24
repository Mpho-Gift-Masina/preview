import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ease, easeInOut } from './motion';

type Variant = 'center' | 'drawer';

interface Props {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  variant?: Variant;
  className?: string;
  /** False blocks Escape and backdrop clicks, e.g. while a payment is processing. */
  dismissible?: boolean;
  /** Runs after the closing animation finishes. */
  onExitComplete?: () => void;
  children: ReactNode;
}

// Enter/leave animations: centre modals rise and fade, drawers slide in from the right.
const panelVariants: Record<Variant, Variants> = {
  center: {
    initial: { opacity: 0, y: 56 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
    exit: { opacity: 0, y: 32, transition: { duration: 0.4, ease: easeInOut } },
  },
  drawer: {
    initial: { x: '100%' },
    animate: { x: 0, transition: { duration: 0.8, ease } },
    exit: { x: '100%', transition: { duration: 0.5, ease: easeInOut } },
  },
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Several modals can overlap while one animates out and the next animates in.
let scrollLocks = 0;
function lockScroll() {
  const root = document.documentElement;
  if (scrollLocks++ === 0) {
    root.style.paddingRight = `${window.innerWidth - root.clientWidth}px`;
    root.style.overflow = 'hidden';
  }
  return () => {
    if (--scrollLocks === 0) {
      root.style.overflow = '';
      root.style.paddingRight = '';
    }
  };
}

/** Animated, accessible modal: traps focus, closes on Escape, restores focus and locks page scroll. */
export function Modal({ open, onExitComplete, ...panel }: Props) {
  return createPortal(
    <AnimatePresence onExitComplete={onExitComplete}>{open && <ModalPanel key="modal" {...panel} />}</AnimatePresence>,
    document.body,
  );
}

/** The visible modal: backdrop + panel. Mounted only while open, so its effects run on open/close. */
function ModalPanel({ onClose, labelledBy, variant = 'center', className = '', dismissible = true, children }: Omit<Props, 'open' | 'onExitComplete'>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unlock = lockScroll();
    const previous = document.activeElement as HTMLElement | null;
    const panel = ref.current;
    if (panel && !panel.contains(document.activeElement)) panel.focus({ preventScroll: true });
    return () => {
      unlock();
      // Hand focus back unless another modal has already taken it.
      const active = document.activeElement;
      if (previous?.isConnected && (!active || active === document.body)) previous.focus({ preventScroll: true });
    };
  }, []);

  // Escape closes the modal even if focus has fallen out of it (e.g. the focused button was removed),
  // and Tab pulls stray focus back inside. Listening on the document makes this work in every case.
  const latest = useRef({ onClose, dismissible });
  latest.current = { onClose, dismissible };
  useEffect(() => {
    function onDocKey(e: globalThis.KeyboardEvent) {
      const panel = ref.current;
      if (!panel) return;
      if (e.key === 'Escape' && latest.current.dismissible) {
        e.preventDefault();
        latest.current.onClose();
      } else if (e.key === 'Tab' && !panel.contains(document.activeElement)) {
        e.preventDefault();
        panel.focus({ preventScroll: true });
      }
    }
    document.addEventListener('keydown', onDocKey);
    return () => document.removeEventListener('keydown', onDocKey);
  }, []);

  /** Tab and Shift+Tab loop around inside the modal instead of escaping to the page. */
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || !ref.current) return;
    const items = ref.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className={`modal-root modal-root--${variant}`}>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease }}
        onClick={() => dismissible && onClose()}
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`modal modal--${variant} ${className}`}
        variants={panelVariants[variant]}
        initial="initial"
        animate="animate"
        exit="exit"
        onKeyDown={onKeyDown}
      >
        {children}
      </motion.div>
    </div>
  );
}
