import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Collection } from './components/Collection';
import { Features } from './components/Features';
import { LaceGuide } from './components/LaceGuide';
import { HowToOrder } from './components/HowToOrder';
import { Footer } from './components/Footer';
import { OrderDialog } from './components/OrderDialog';
import { useReveal } from './hooks/useReveal';
import { OrderContext } from './order';
import { useCallback, useState } from 'react';

export default function App() {
  useReveal();
  const [orderFor, setOrderFor] = useState<string | undefined>(undefined);
  const openOrder = useCallback((productId?: string) => setOrderFor(productId ?? ''), []);

  return (
    <OrderContext.Provider value={openOrder}>
      <a className="skip-link" href="#collection">
        Skip to collection
      </a>
      <div className="backdrop" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Collection />
        <Features />
        <LaceGuide />
        <HowToOrder />
      </main>
      <Footer />
      <OrderDialog productId={orderFor} onClose={() => setOrderFor(undefined)} />
    </OrderContext.Provider>
  );
}
