import { TOPICS } from "../data.js";

const Run = () =>
  TOPICS.map((t) => (
    <span key={t} className="marquee__item">
      {t}
      <i />
    </span>
  ));

// Bande de mots qui défile en boucle (le contenu est doublé pour un raccord invisible).
export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        <Run />
        <Run />
      </div>
    </div>
  );
}
