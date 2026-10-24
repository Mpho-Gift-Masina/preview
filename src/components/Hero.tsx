import { useTilt } from '../hooks/useTilt';
import { products } from '../data/products';
import { Icon } from './Icon';

const slides = products.flatMap((p) => p.images.map((src) => ({ src, name: p.name })));

export function Hero() {
  const stage = useTilt<HTMLDivElement>(6);

  return (
    <section id="top" className="hero">
      <div className="hero__copy" data-reveal>
        <p className="pill glass">
          <Icon name="sparkle" size={14} /> New drop · {products.length} signature units
        </p>
        <h1 className="hero__title">
          Hair that <em>turns</em> heads.
        </h1>
        <p className="hero__lede">
          Lace frontal wigs in platinum, burgundy, chocolate and jet black. Transparent lace,
          adjustable fit, ready to slay straight out of the box.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary btn--lg" href="#collection">
            Shop the collection <Icon name="arrow" size={18} />
          </a>
          <a className="btn btn--glass btn--lg" href="#how-to-order">
            How to order
          </a>
        </div>
        <dl className="hero__stats">
          <div className="glass">
            <dt>From</dt>
            <dd>R600</dd>
          </div>
          <div className="glass">
            <dt>Lengths</dt>
            <dd>24–30"</dd>
          </div>
          <div className="glass">
            <dt>Lace</dt>
            <dd>13x4 · 13x6</dd>
          </div>
        </dl>
      </div>

      <div
        className="hero__stage"
        ref={stage.ref}
        onPointerMove={stage.onPointerMove}
        onPointerLeave={stage.onPointerLeave}
        aria-label="Rotating showcase of Cutesify wigs"
        role="img"
      >
        <div className="carousel-tilt">
          <div className="carousel" style={{ ['--count' as string]: slides.length }}>
            {slides.map((s, i) => (
              <figure className="carousel__item glass" key={s.src} style={{ ['--i' as string]: i }}>
                <img src={s.src} alt="" width={300} height={400} />
                <figcaption>{s.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="orb orb--a" aria-hidden="true" />
        <div className="orb orb--b" aria-hidden="true" />
        <div className="orb orb--c" aria-hidden="true" />
      </div>
    </section>
  );
}
