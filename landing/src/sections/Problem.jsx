import { useState } from "react";
import ricoSurpris from "../assets/rico-surpris.png";
import Reveal from "../components/Reveal.jsx";
import { LockIcon } from "../components/icons.jsx";
import { LOCKED } from "../data.js";

// Carte verrouillée : s'ouvre au survol, et au clic/toucher sur mobile.
function LockCard({ title, delay }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal
      as="button"
      type="button"
      delay={delay}
      className={`lock ${open ? "is-open" : ""}`}
      onClick={() => setOpen((v) => !v)}
      aria-pressed={open}
    >
      <LockIcon />
      <span className="lock__title display">{title}</span>
      <span className="lock__status lock__status--closed">Verrouillé</span>
      <span className="lock__status lock__status--open">Rico t’explique en 5 min</span>
    </Reveal>
  );
}

export default function Problem() {
  return (
    <section className="problem">
      <div className="problem__grid">
        <div className="problem__text">
          <span className="label">Le problème</span>
          <Reveal as="h2" className="h2">
            Personne ne t’a appris ça à l’école.
          </Reveal>
          <p className="lead" style={{ maxWidth: 430 }}>
            Résultat : 1 jeune sur 2 dit avoir la phobie administrative. Passe sur une carte pour la déverrouiller.
          </p>
          <img className="float" src={ricoSurpris} alt="" style={{ width: 140, marginTop: 6, "--d": "4.6s" }} />
        </div>
        <div className="problem__cards">
          {LOCKED.map((t, i) => (
            <LockCard key={t} title={t} delay={i * 70} />
          ))}
        </div>
      </div>
    </section>
  );
}
