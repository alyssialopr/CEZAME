import Reveal from "../components/Reveal.jsx";
import Phone from "../components/Phone.jsx";
import LessonScreen from "../components/screens/LessonScreen.jsx";
import QuizScreen from "../components/screens/QuizScreen.jsx";
import StreakScreen from "../components/screens/StreakScreen.jsx";

const STEPS = [
  {
    title: "Tu choisis une leçon",
    text: "Un sujet, une étape. Ça tient dans un trajet de bus.",
    bg: "#C9D5FF",
    tilt: -4,
    Screen: LessonScreen,
  },
  {
    title: "Tu joues le quiz",
    text: "Tu te trompes ? Rico t’explique, sans te faire la morale.",
    bg: "#BFF0E3",
    tilt: 3,
    Screen: QuizScreen,
  },
  {
    title: "Tu gardes ta flamme",
    text: "Une leçon par jour, des diamants à gagner, et un rappel quand une vraie date approche.",
    bg: "#FFDFB8",
    tilt: -3,
    Screen: StreakScreen,
  },
];

export default function HowItWorks() {
  return (
    <section id="comment" className="section section--stack how">
      <div className="section__head">
        <span className="label">Comment ça marche</span>
        <Reveal as="h2" className="h2">
          Trois gestes, cinq minutes.
        </Reveal>
      </div>
      <div className="steps">
        {STEPS.map(({ title, text, bg, tilt, Screen }, i) => (
          <Reveal key={title} className="step" delay={i * 110} style={{ background: bg }}>
            <span className="step__num display">{i + 1}</span>
            <h3 className="display">{title}</h3>
            <p>{text}</p>
            <div className="step__phone" style={{ "--r": `${tilt}deg` }}>
              <Phone>
                <Screen />
              </Phone>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
