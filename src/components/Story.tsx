import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { ease } from './motion';
import brandImage from '../../assets/cutesify-brand.jpeg';
import meVsHimImage from '../../assets/story-me-vs-him.jpeg';
import wigOclockImage from '../../assets/wig-oclock.jpeg';

// TODO: Cutesify team, swap in your own words: this copy is a starting point.
// `fit: 'contain'` shows the whole graphic on `bg` (matched to the image's own background) instead of cropping it.
const chapters = [
  {
    kicker: 'Chapter 01',
    title: 'A unit for every mood',
    body: 'Cutesify started with a simple idea: switching up your look should feel exciting, never stressful. Icy platinum on Friday, deep burgundy by Sunday.',
    image: brandImage,
    alt: 'The Cutesify Hair Company logo in glossy pink lettering.',
    fit: 'contain',
    // Follows the photo's own top-to-bottom shading so the letterbox bands disappear.
    bg: 'linear-gradient(#f8e0e3, #f0c7cd)',
    blob: '#ff8fbf',
  },
  {
    kicker: 'Chapter 02',
    title: 'This is how it should be',
    body: 'Him: one look, forever. You: a whole wardrobe of hair living rent-free in your head. We built Cutesify for the second one.',
    image: meVsHimImage,
    alt: 'Cutesify graphic titled "this is how it should be": a woman’s silhouette filled with many wigs beside a man’s silhouette holding just a few.',
    fit: 'contain',
    bg: '#f8f4f1',
    blob: '#ffb3d1',
  },
  {
    kicker: 'Chapter 03',
    title: 'Made for the girls',
    body: 'Transparent lace, adjustable fits and statement colours, delivered across South Africa or ready to collect. Pick your unit and make it yours.',
    image: wigOclockImage,
    alt: 'Cutesify graphic "It’s wig o’clock": a clock face with a different wig at every hour.',
    fit: 'contain',
    bg: '#fee7f9',
    blob: '#f9a8d8',
  },
] as const;

/**
 * "Our story": a tall section whose inner scene stays pinned while you scroll.
 * Scrolling moves through the chapters; liquid blobs drift behind a glass card.
 */
export function Story() {
  const ref = useRef<HTMLElement>(null);
  // Index of the chapter currently showing.
  const [active, setActive] = useState(0);
  // 0 → 1 as you scroll from the top of the section to its bottom.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // A springy copy of the scroll progress, so the blobs and progress bar glide instead of jumping.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // Split the scroll into equal parts, one per chapter.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(chapters.length - 1, Math.max(0, Math.floor(v * chapters.length))));
  });

  // Liquid blobs drift on different paths as the story scrolls.
  const aX = useTransform(progress, [0, 1], ['-10%', '35%']);
  const aY = useTransform(progress, [0, 1], ['0%', '30%']);
  const bX = useTransform(progress, [0, 1], ['30%', '-25%']);
  const bY = useTransform(progress, [0, 1], ['10%', '-20%']);
  const cX = useTransform(progress, [0, 1], ['10%', '-5%']);
  const cY = useTransform(progress, [0, 1], ['30%', '-15%']);
  const rotate = useTransform(progress, [0, 1], [0, 120]);

  /** Chapter dot clicked: scroll to the middle of that chapter's slice of the section. */
  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + travel * ((i + 0.5) / chapters.length), behavior: 'smooth' });
  }

  const chapter = chapters[active];

  return (
    <section id="story" ref={ref} className="story" style={{ height: `${chapters.length * 100}vh` }}>
      {/* Screen readers get the whole story at once; the animated version below is visual only. */}
      <div className="sr-only">
        <h2>Our story</h2>
        {chapters.map((c) => (
          <div key={c.title}>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </div>

      <div className="story__sticky" aria-hidden="true">
        <div className="story__liquid">
          <motion.span className="blob blob--a" style={{ x: aX, y: aY, rotate }} animate={{ backgroundColor: chapter.blob }} transition={{ duration: 1.2 }} />
          <motion.span className="blob blob--b" style={{ x: bX, y: bY }} />
          <motion.span className="blob blob--c" style={{ x: cX, y: cY }} animate={{ backgroundColor: chapter.blob }} transition={{ duration: 1.2, delay: 0.1 }} />
          <motion.span className="blob blob--d" style={{ x: bY, y: aX }} />
        </div>

        <div className="story__inner">
          <div className="story__copy glass liquid">
            <p className="eyebrow">Our story</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -24, filter: 'blur(10px)' }}
                transition={{ duration: 0.55, ease }}
              >
                <p className="story__kicker">{chapter.kicker}</p>
                <h2 className="story__title">{chapter.title}</h2>
                <p className="story__body">{chapter.body}</p>
              </motion.div>
            </AnimatePresence>

            <div className="story__nav">
              {chapters.map((c, i) => (
                <button key={c.title} tabIndex={-1} className={i === active ? 'is-active' : ''} onClick={() => goTo(i)}>
                  {i === active && <motion.span className="story__dot" layoutId="story-dot" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                  <span>0{i + 1}</span>
                </button>
              ))}
              <div className="story__progress">
                <motion.span style={{ scaleX: progress }} />
              </div>
            </div>
          </div>

          <div className="story__visual glass">
            <AnimatePresence initial={false}>
              <motion.img
                key={chapter.image}
                src={chapter.image}
                alt=""
                className={`story__img story__img--${chapter.fit}`}
                style={{ background: chapter.bg }}
                initial={{ clipPath: 'circle(0% at 50% 100%)', scale: 1.12 }}
                animate={{ clipPath: 'circle(150% at 50% 100%)', scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.7 } }}
                transition={{ duration: 1.1, ease }}
              />
            </AnimatePresence>
            <span className="story__shine" />
          </div>
        </div>
      </div>
    </section>
  );
}
