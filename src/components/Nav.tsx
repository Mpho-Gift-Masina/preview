import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useCart } from '../cart/CartContext';
import { POLICIES_HREF, type Route } from '../hooks/useRoute';
import { Icon } from './Icon';
import { ease } from './motion';

const links = [
  { href: '#collection', label: 'Collection' },
  { href: '#story', label: 'Our story' },
  { href: '#lace-guide', label: 'Lace guide' },
  { href: POLICIES_HREF, label: 'Policies' },
];

/** A springy liquid drop that flows between links. */
const liquidSpring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.9 } as const;

/** Liquid-glass header pill (top right): logo, page links, bag button, and a drop-down menu on phones. */
export function Nav({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeIndex = route === 'policies' ? links.length - 1 : -1;
  const [hovered, setHovered] = useState<number>(activeIndex);
  const { items, openCart } = useCart();
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  useEffect(() => setHovered(activeIndex), [activeIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <motion.nav
        className="nav__bar glass liquid"
        aria-label="Main"
        initial={{ opacity: 0, y: -24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease }}
      >
        <a href="#top" className="nav__brand" onClick={() => setOpen(false)}>
          <img src="/images/logo.webp" alt="" width={34} height={34} />
          <span>Cutesify</span>
        </a>

        <ul className="nav__links" onMouseLeave={() => setHovered(activeIndex)}>
          {links.map((l, i) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={i === activeIndex ? 'page' : undefined}
                onMouseEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(activeIndex)}
              >
                {hovered === i && <motion.span className="nav__drop" layoutId="nav-drop" transition={liquidSpring} />}
                <span className="nav__label">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <button
          className="nav__bag"
          onClick={() => {
            setOpen(false);
            openCart();
          }}
          aria-label={`Open bag, ${count} ${count === 1 ? 'item' : 'items'}`}
        >
          <Icon name="bag" size={18} />
          <AnimatePresence initial={false}>
            {count > 0 && (
              <motion.span
                key={count}
                className="nav__count"
                aria-hidden="true"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} size={20} />
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="nav-menu"
            className="nav__menu glass liquid"
            initial={{ opacity: 0, scale: 0.6, borderRadius: 40 }}
            animate={{ opacity: 1, scale: 1, borderRadius: 24 }}
            exit={{ opacity: 0, scale: 0.7, borderRadius: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            {links.map((l, i) => (
              <motion.li
                key={l.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.08 + i * 0.05 }}
              >
                <a href={l.href} aria-current={i === activeIndex ? 'page' : undefined} onClick={() => setOpen(false)}>
                  {l.label}
                  <Icon name="arrow" size={16} />
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
