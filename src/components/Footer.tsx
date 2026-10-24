import { useOpenOrder } from '../order';
import { Icon } from './Icon';

export function Footer() {
  const openOrder = useOpenOrder();
  return (
    <footer className="footer">
      <div className="cta glass" data-reveal>
        <img src="/images/logo.webp" alt="Cutesify Hair Company" width={140} height={140} loading="lazy" />
        <div>
          <h2>Ready for your next look?</h2>
          <p>Place your order in a minute. We'll email you to confirm the details.</p>
        </div>
        <button className="btn btn--primary btn--lg" onClick={() => openOrder()}>
          <Icon name="bag" size={18} /> Place an order
        </button>
      </div>
      <div className="footer__bar">
        <p>© {new Date().getFullYear()} Cutesify Hair Company</p>
        <nav aria-label="Footer">
          <a href="#collection">Collection</a>
          <a href="#lace-guide">Lace guide</a>
          <a href="#how-to-order">How to order</a>
        </nav>
      </div>
    </footer>
  );
}
