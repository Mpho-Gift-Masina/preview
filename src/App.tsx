import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Collection } from './components/Collection';
import { Features } from './components/Features';
import { LaceGuide } from './components/LaceGuide';
import { HowToOrder } from './components/HowToOrder';
import { Footer } from './components/Footer';
import { useReveal } from './hooks/useReveal';

export default function App() {
  useReveal();

  return (
    <>
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
    </>
  );
}
