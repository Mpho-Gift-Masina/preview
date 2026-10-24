import { SAME_DAY } from '../config';
import { Icon } from './Icon';

const words = [
  'Transparent lace',
  '13x4 frontal',
  `Same-day delivery in ${SAME_DAY.area}`,
  '13x6 frontal',
  'Adjustable straps',
  'Breathable cap',
  'Platinum blonde',
  '99J burgundy',
  'Body wave',
];

/** Endless scrolling ribbon of keywords. The row is rendered twice so the loop has no gap. */
export function Marquee() {
  const row = words.map((w) => (
    <span key={w}>
      {w} <Icon name="sparkle" size={16} />
    </span>
  ));
  return (
    <div className="marquee" aria-label={words.join(', ')} role="note">
      <div className="marquee__track" aria-hidden="true">
        <div className="marquee__group">{row}</div>
        <div className="marquee__group">{row}</div>
      </div>
    </div>
  );
}
