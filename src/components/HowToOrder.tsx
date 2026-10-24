const steps = [
  { title: 'Pick your unit', body: 'Browse the collection and choose the length, colour and lace you love.' },
  { title: 'Send your order', body: 'Tap Order and fill in your name, contact details and delivery address.' },
  { title: 'Confirm and slay', body: 'We email you to confirm availability, then arrange payment and delivery.' },
];

export function HowToOrder() {
  return (
    <section id="how-to-order" className="section">
      <div className="section__head" data-reveal>
        <p className="eyebrow">How to order</p>
        <h2>Three steps to your new look</h2>
      </div>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={s.title} className="step glass" data-reveal style={{ ['--delay' as string]: `${i * 90}ms` }}>
            <span className="step__num" aria-hidden="true">
              0{i + 1}
            </span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
