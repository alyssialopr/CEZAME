import Nav from "./sections/Nav.jsx";
import Hero from "./sections/Hero.jsx";
import Marquee from "./sections/Marquee.jsx";
import Problem from "./sections/Problem.jsx";
import Worlds from "./sections/Worlds.jsx";
import HowItWorks from "./sections/HowItWorks.jsx";
import Quiz from "./sections/Quiz.jsx";
import FreeAndSchools from "./sections/FreeAndSchools.jsx";
import FinalCta from "./sections/FinalCta.jsx";
import Footer from "./sections/Footer.jsx";

export default function App() {
  return (
    <div className="page">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Problem />
        <Worlds />
        <HowItWorks />
        <Quiz />
        <FreeAndSchools />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
