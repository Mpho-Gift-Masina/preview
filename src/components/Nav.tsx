import { useEffect, useState } from 'react';
import { useOpenOrder } from '../order';
import { Icon } from './Icon';

const links = [
  { href: '#collection', label: 'Collection' },
  { href: '#lace-guide', label: 'Lace guide' },
  { href: '#how-to-order', label: 'How to order' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openOrder = useOpenOrder();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <nav className="nav__bar glass" aria-label="Main">
        <a href="#top" className="nav__brand" onClick={() => setOpen(false)}>
          <img src="/images/logo.webp" alt="" width={36} height={36} />
          <span>Cutesify</span>
        </a>

        <ul id="nav-links" className={`nav__links ${open ? 'is-open' : ''}`}>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
          <li className="nav__links-cta">
            <button
              className="btn btn--primary"
              onClick={() => {
                setOpen(false);
                openOrder();
              }}
            >
              <Icon name="bag" size={18} />
              Order now
            </button>
          </li>
        </ul>

        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </nav>
    </header>
  );
}
