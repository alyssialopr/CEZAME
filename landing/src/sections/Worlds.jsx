import Reveal from "../components/Reveal.jsx";
import { BigIcon } from "../components/icons.jsx";
import { Sparkle } from "../components/Floating.jsx";
import { WORLDS } from "../data.js";

function Door({ world, index }) {
  return (
    <Reveal className="door" delay={index * 90}>
      <div className="door__frame" style={{ background: world.bg, borderColor: world.border }}>
        <BigIcon className="door__icon" name={world.icon} color={world.iconColor} />
        <span className="door__num display">0{index + 1}</span>
        <span className="door__knob" aria-hidden="true" />
        <img className="door__rico" src={world.rico} alt="" />
      </div>
      <div className="door__label">
        <div className="door__name display">{world.name}</div>
        <div className="door__sub">{world.sub}</div>
      </div>
    </Reveal>
  );
}

export default function Worlds() {
  return (
    <section id="mondes" className="section section--stack worlds">
      <Sparkle left="8%" top={90} size={16} duration={3} delay={0} />
      <Sparkle left="90%" top={140} size={20} duration={4} delay={1} />
      <Sparkle left="76%" top={60} size={12} duration={3.2} delay={2} />
      <div className="section__head">
        <span className="label">Les 5 mondes</span>
        <Reveal as="h2" className="h2">
          Cinq portes. Derrière, la vraie vie.
        </Reveal>
        <p className="lead">Chaque monde a son Rico. Tu ouvres, tu joues, tu sais faire.</p>
      </div>
      <div className="doors">
        {WORLDS.map((w, i) => (
          <Door key={w.name} world={w} index={i} />
        ))}
      </div>
    </section>
  );
}
