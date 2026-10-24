import { useEffect, useState } from 'react';
import { MotionConfig, useAnimate } from 'framer-motion';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Collection } from './components/Collection';
import { Story } from './components/Story';
import { Features } from './components/Features';
import { LaceGuide } from './components/LaceGuide';
import { HowToOrder } from './components/HowToOrder';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Checkout } from './components/Checkout';
import { PoliciesPage } from './components/PoliciesPage';
import { LiquidFilters, smooth } from './components/motion';
import { CartProvider } from './cart/CartContext';
import { useRoute, type Route } from './hooks/useRoute';

/** The shop's landing page: every home section, top to bottom. */
function HomePage() {
  // Coming back from the policies page via a link like #collection: jump to that section once it exists.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && !id.startsWith('/')) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <>
      <Hero />
      <Marquee />
      <Collection />
      <Story />
      <Features />
      <LaceGuide />
      <HowToOrder />
    </>
  );
}

/**
 * Page-to-page transition: the old page fades and lifts away, the window jumps to the top,
 * then the new page rises in. Driven by hand (useAnimate) rather than AnimatePresence, which
 * could get stuck waiting on animations nested deep inside the old page (e.g. the story).
 * No `filter` here: a leftover filter on <main> would stop the glass panels inside from blurring the backdrop.
 */
function usePageTransition(route: Route) {
  const [scope, animate] = useAnimate<HTMLElement>();
  // The page actually on screen; lags behind `route` while the old page fades out.
  const [shown, setShown] = useState(route);

  // Route changed: fade the current page out, then swap.
  useEffect(() => {
    if (route === shown) return;
    let cancelled = false;
    animate(scope.current, { opacity: 0, y: -20 }, { duration: 0.35, ease: smooth }).then(() => {
      if (cancelled) return;
      window.scrollTo({ top: 0, behavior: 'instant' });
      setShown(route);
    });
    return () => {
      cancelled = true;
    };
  }, [route, shown, animate, scope]);

  // A page has just been put on screen (including the first load): rise it in.
  useEffect(() => {
    animate(scope.current, { opacity: [0, 1], y: [28, 0] }, { duration: 0.8, ease: smooth });
  }, [shown, animate, scope]);

  return { scope, shown };
}

export default function App() {
  const route = useRoute();
  const { scope, shown } = usePageTransition(route);

  // The SVG "liquid" refraction only renders in Chromium; other browsers keep plain frosted glass.
  useEffect(() => {
    const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
    if (brands?.some((b) => b.brand === 'Chromium')) document.documentElement.classList.add('has-liquid');
  }, []);

  return (
    // Respect the visitor's "reduce motion" setting for every Framer Motion animation.
    <MotionConfig reducedMotion="user">
      {/* Shares the bag (cart) and which panel is open with every component. */}
      <CartProvider>
        <LiquidFilters />

        {/* Keyboard users can jump past the header straight to the page content. */}
        <a
          className="skip-link"
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('main')?.focus();
          }}
        >
          Skip to content
        </a>

        {/* Blurred product photos behind the whole site, under a white veil. */}
        <div className="backdrop" aria-hidden="true">
          <span className="backdrop__img backdrop__img--a" />
          <span className="backdrop__img backdrop__img--b" />
          <span className="backdrop__img backdrop__img--c" />
          <span className="backdrop__veil" />
        </div>

        <Nav route={route} />

        {/* The current page; usePageTransition fades it out and in when the route changes. */}
        <main ref={scope} id="main" tabIndex={-1}>
          {shown === 'home' ? <HomePage key="home" /> : <PoliciesPage key="policies" />}
        </main>

        <Footer />

        {/* Overlays: the bag drawer and the checkout modal. */}
        <CartDrawer />
        <Checkout />
      </CartProvider>
    </MotionConfig>
  );
}
