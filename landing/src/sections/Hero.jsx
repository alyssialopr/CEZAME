import { useState } from "react";
import ricoJoy from "../assets/rico-joy.png";
import keyholeImg from "../assets/keyhole.svg";
import starImg from "../assets/star.svg";
import keyImg from "../assets/key.svg";
import coinImg from "../assets/coin.svg";
import docImg from "../assets/doc.svg";
import heartImg from "../assets/heart.svg";
import houseImg from "../assets/house.svg";
import diamondImg from "../assets/diamond.svg";
import Button from "../components/Button.jsx";
import { BellIcon, CheckIcon, FlameIcon } from "../components/icons.jsx";
import { Cloud, FloatingObject, Rays, Sparkle } from "../components/Floating.jsx";

const OBJECTS = [
  { src: keyImg, width: 79, depth: 34, rotate: -8, duration: 5, delay: 0, style: { left: "23%", top: 30 } },
  { src: coinImg, width: 73, depth: 40, rotate: 6, duration: 6, delay: 1.5, style: { right: "22%", top: 16 } },
  { src: docImg, width: 79, depth: 22, rotate: -4, duration: 6.5, delay: 2.5, hideOnMobile: true, style: { left: "16%", top: 300 } },
  { src: heartImg, width: 53, depth: 30, rotate: 8, duration: 4.6, delay: 0.7, style: { right: "19%", top: 230 } },
  { src: houseImg, width: 76, depth: 18, rotate: 4, duration: 7, delay: 3, hideOnMobile: true, style: { right: "27%", bottom: 170 } },
  { src: diamondImg, width: 53, depth: 36, rotate: -6, duration: 5.2, delay: 1.1, style: { left: "28%", bottom: 150 } },
];

const SPARKLES = [
  { left: "8%", top: 250, size: 16, duration: 3, delay: 0 },
  { left: "22%", top: 190, size: 10, duration: 4, delay: 1 },
  { left: "90%", top: 230, size: 18, duration: 3.8, delay: 1.4 },
  { left: "76%", top: 180, size: 10, duration: 3, delay: 2.2 },
  { left: "14%", top: 600, size: 12, duration: 4.2, delay: 0.8 },
  { left: "86%", top: 640, size: 10, duration: 3, delay: 1.9 },
];

function GlassCard({ icon, iconBg, title, sub, delay, style }) {
  return (
    <div className="glass px hide-sm" aria-hidden="true" style={{ "--k": "20px", ...style }}>
      <div className="glass__card float" style={{ "--d": "6s", "--dl": `-${delay}s` }}>
        <span className="glass__icon" style={{ background: iconBg }}>
          {icon}
        </span>
        <span className="glass__text">
          <b>{title}</b>
          <span>{sub}</span>
        </span>
      </div>
    </div>
  );
}

const Check = ({ children }) => (
  <span className="check">
    <i>
      <CheckIcon size={11} color="#1F1A3A" width={3.6} />
    </i>
    {children}
  </span>
);

export default function Hero() {
  const [jump, setJump] = useState(false);

  // Les objets suivent légèrement la souris (variables CSS lues par la classe .px).
  const onMouseMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };

  return (
    <section id="top" className="hero" onMouseMove={onMouseMove}>
      {SPARKLES.map((s, i) => (
        <Sparkle key={i} {...s} />
      ))}

      <div className="hero__text">
        <span className="pill pop">
          <img src={starImg} alt="" />
          Le Duolingo de la vie d’adulte
        </span>
        <h1 className="display pop" style={{ "--dl": "0.1s" }}>
          Débloque la vie <em>d’adulte</em>,<br />5 minutes par jour.
        </h1>
        <p className="hero__lead pop" style={{ "--dl": "0.25s" }}>
          Impôts, bail, banque, santé : Rico t’explique tout avec des leçons courtes et des quiz. Plus rien ne te bloque.
        </p>
        <div className="hero__cta pop" style={{ "--dl": "0.38s" }}>
          <Button href="#telecharger" arrow>
            Commencer gratuitement
          </Button>
          <Button href="#comment" variant="ghost">
            Voir comment ça marche
          </Button>
        </div>
        <div className="hero__checks pop" style={{ "--dl": "0.5s" }}>
          <Check>100 % gratuit</Check>
          <Check>5 min par jour</Check>
          <Check>Pour les 16-25 ans</Check>
        </div>
      </div>

      <div className="stage pop" style={{ "--dl": "0.3s" }}>
        <Rays />
        <div className="glow" aria-hidden="true" />
        <div className="stage__keyhole px" style={{ "--k": "8px" }}>
          <img src={keyholeImg} alt="" />
        </div>
        <button
          type="button"
          className="stage__rico px"
          style={{ "--k": "24px" }}
          onClick={() => setJump(true)}
          aria-label="Faire sauter Rico"
        >
          <img
            className={jump ? "jump" : "float"}
            src={ricoJoy}
            alt="Rico, la mascotte de Cezame, sort d’une serrure géante"
            style={{ "--d": "5.5s" }}
            onAnimationEnd={() => setJump(false)}
          />
        </button>
        {OBJECTS.map((o, i) => (
          <FloatingObject key={i} {...o} />
        ))}
        <GlassCard
          icon={<FlameIcon />}
          iconBg="#FFF1DC"
          title="5 jours de suite"
          sub="Ta série continue"
          delay={0}
          style={{ left: "1%", top: 150 }}
        />
        <GlassCard
          icon={<CheckIcon size={18} width={3.4} />}
          iconBg="#7CC452"
          title="+50 XP"
          sub="Leçon terminée"
          delay={2}
          style={{ right: "0%", top: 110 }}
        />
        <GlassCard
          icon={<BellIcon />}
          iconBg="#EFE8FF"
          title="Rappel de Rico"
          sub="Impôts : c’est bientôt"
          delay={3.5}
          style={{ right: "3%", bottom: 150 }}
        />
      </div>

      <div className="clouds" aria-hidden="true">
        <Cloud width={448} duration={11} style={{ left: "-6%", bottom: -60 }} />
        <Cloud width={416} duration={14} style={{ left: "22%", bottom: -80 }} />
        <Cloud width={480} duration={10} style={{ left: "48%", bottom: -80 }} />
        <Cloud width={448} duration={13} style={{ right: "-8%", bottom: -66 }} />
      </div>
      <div className="hero__fade" aria-hidden="true" />
    </section>
  );
}
