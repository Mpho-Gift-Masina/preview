import { whatsappLink } from '../config';
import { Icon } from './Icon';

export function Footer() {
  return (
    <footer className="footer">
      <div className="cta glass" data-reveal>
        <img src="/images/logo.webp" alt="Cutesify Hair Company" width={140} height={140} loading="lazy" />
        <div>
          <h2>Ready for your next look?</h2>
          <p>Message us and we'll help you choose the perfect unit.</p>
        </div>
        <a className="btn btn--primary btn--lg" href={whatsappLink('Hi Cutesify! Please help me choose a unit.')} target="_blank" rel="noreferrer">
          <Icon name="whatsapp" size={18} /> Message us
        </a>
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
