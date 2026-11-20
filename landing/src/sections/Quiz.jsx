import { useMemo, useState } from "react";
import ricoEntrepriseDroit from "../assets/rico-entreprise-droit.png";
import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import { HeartIcon } from "../components/icons.jsx";
import { QUIZ } from "../data.js";

const CONFETTI_COLORS = ["#C6F08F", "#FFD25E", "#FF8E84", "#5AD8EA", "#B9A4FF", "#FF7FA8"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        left: `${2 + Math.random() * 94}%`,
        width: 8 + Math.floor(Math.random() * 3) * 2,
        height: 10 + Math.floor(Math.random() * 3) * 4,
        background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        "--d": `${(1.2 + Math.random()).toFixed(2)}s`,
        "--dl": `${(Math.random() * 0.5).toFixed(2)}s`,
      })),
    [],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((style, i) => (
        <span key={i} style={style} />
      ))}
    </div>
  );
}

export default function Quiz() {
  const [picked, setPicked] = useState(null);
  const answered = picked !== null;
  const isGood = answered && QUIZ.answers.find((a) => a.id === picked).good;

  const stateOf = (a) => {
    if (!answered) return "";
    if (a.good) return "answer--good";
    return a.id === picked ? "answer--bad" : "answer--dim";
  };

  return (
    <section id="quiz" className="section section--stack quiz">
      <div className="quiz__grid">
        <div className="quiz__text">
          <span className="label">Teste-toi</span>
          <Reveal as="h2" className="h2">
            Une vraie question de l’app. Tu tentes ?
          </Reveal>
          <p className="lead" style={{ maxWidth: 400 }}>
            Clique sur ta réponse. Rico te dit tout de suite si c’est bon.
          </p>
          <img className="float" src={ricoEntrepriseDroit} alt="" style={{ height: 170, "--d": "5s" }} />
        </div>

        <Reveal className={`quiz-card ${answered && !isGood ? "is-wrong" : ""}`}>
          {isGood && <Confetti />}
          <div className="quiz-card__top">
            <div className="progress">
              <div style={{ width: answered ? "100%" : "35%" }} />
            </div>
            <span className="quiz-card__lives">
              <HeartIcon />5
            </span>
          </div>
          <div className="quiz-card__topic">{QUIZ.topic}</div>
          <div className="quiz-card__question display">{QUIZ.question}</div>

          {QUIZ.answers.map((a, i) => (
            <button key={a.id} type="button" className={`answer ${stateOf(a)}`} disabled={answered} onClick={() => setPicked(a.id)}>
              <span className="answer__letter">{"ABC"[i]}</span>
              <span className="answer__text">{a.text}</span>
            </button>
          ))}

          {answered && (
            <div className={`feedback ${isGood ? "feedback--good" : "feedback--bad"}`} role="status">
              <div className="feedback__title display">{isGood ? "Débloqué !" : "Raté, mais t’inquiète"}</div>
              <p>
                {!isGood && "La bonne réponse, c’est A. "}
                {QUIZ.explanation}
              </p>
            </div>
          )}

          {answered && (
            <div className="quiz-card__actions">
              <Button href="#telecharger" arrow>
                La suite dans l’app
              </Button>
              <button type="button" className="btn btn--white" onClick={() => setPicked(null)}>
                Rejouer
              </button>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
