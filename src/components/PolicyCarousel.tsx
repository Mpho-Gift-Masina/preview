import { useRef, useState, type KeyboardEvent } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { policyPosters } from '../data/policies';
import { Icon } from './Icon';
import { ease } from './motion';

const count = policyPosters.length;

/** How far a swipe must travel (px) or how fast it must be (px/s) to change card. */
const SWIPE_DISTANCE = 60;
const SWIPE_SPEED = 400;

/**
 * Where card `i` sits relative to the active card: 0 = centre, -1 = left, 1 = right.
 * Wraps around, so the first and last cards are neighbours (an endless loop).
 */
function offsetFrom(i: number, active: number) {
  let d = i - active;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

/**
 * 3D "coverflow" carousel of the policy graphics.
 * Swipe or drag the stage, use the arrows, the dots or the keyboard ← → keys.
 * Tapping the centre card opens it full size (`onOpen`); tapping a side card brings it to the centre.
 */
export function PolicyCarousel({ onOpen }: { onOpen: (index: number) => void }) {
  const [active, setActive] = useState(0);
  // True while a drag is in progress, so the click that ends a drag doesn't also open a card.
  const dragging = useRef(false);

  /** Move by `step` cards (-1 = previous, 1 = next), looping at both ends. */
  const go = (step: number) => setActive((a) => (a + step + count) % count);

  /** Decide on drag release whether it was a swipe left, a swipe right or neither. */
  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_SPEED) go(1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_SPEED) go(-1);
    // Let the click event that follows the drag pass first, then re-enable clicks.
    setTimeout(() => (dragging.current = false), 0);
  }

  /** ← and → move between cards when the carousel has keyboard focus. */
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  }

  return (
    <div className="pcarousel" role="region" aria-roledescription="carousel" aria-label="Policy cards" onKeyDown={onKeyDown}>
      {/* Draggable stage; the drag springs back while the cards themselves animate to their new spots. */}
      <motion.div
        className="pcarousel__stage"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        onDragStart={() => (dragging.current = true)}
        onDragEnd={onDragEnd}
      >
        {policyPosters.map((poster, i) => {
          const offset = offsetFrom(i, active);
          const isActive = offset === 0;
          return (
            <motion.button
              key={poster.src}
              className={`pcarousel__card glass ${isActive ? 'is-active' : ''}`}
              style={{ zIndex: count - Math.abs(offset) }}
              // Centre card: full size and flat. Side cards: pushed out, smaller, turned inwards and faded.
              animate={{
                x: `${offset * 64}%`,
                scale: isActive ? 1 : 0.8,
                rotateY: offset * -30,
                opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.6,
              }}
              transition={{ duration: 0.75, ease }}
              onClick={() => {
                if (dragging.current) return;
                if (isActive) onOpen(i);
                else setActive(i);
              }}
              tabIndex={isActive ? 0 : -1}
              aria-label={isActive ? `Enlarge policy card ${i + 1} of ${count}` : `Show policy card ${i + 1} of ${count}`}
            >
              <img src={poster.src} alt={poster.alt} width={1086} height={1450} draggable={false} />
              {isActive && (
                <span className="pcarousel__zoom" aria-hidden="true">
                  <Icon name="expand" size={18} />
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Controls: previous, one dot per card (the pink pill slides to the active one), next. */}
      <div className="pcarousel__controls">
        <button className="icon-btn" onClick={() => go(-1)} aria-label="Previous policy card">
          <Icon name="back" size={18} />
        </button>
        <div className="pcarousel__dots">
          {policyPosters.map((poster, i) => (
            <button
              key={poster.src}
              className={i === active ? 'is-active' : ''}
              onClick={() => setActive(i)}
              aria-label={`Go to policy card ${i + 1}`}
              aria-current={i === active}
            >
              {i === active && <motion.span layoutId="pcarousel-dot" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            </button>
          ))}
        </div>
        <button className="icon-btn" onClick={() => go(1)} aria-label="Next policy card">
          <Icon name="arrow" size={18} />
        </button>
      </div>

      {/* Announces the change to screen-reader users. */}
      <p className="sr-only" aria-live="polite">
        Policy card {active + 1} of {count}
      </p>
    </div>
  );
}
