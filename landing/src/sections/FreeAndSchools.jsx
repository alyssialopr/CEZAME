import coinImg from "../assets/coin.svg";
import diamondImg from "../assets/diamond.svg";
import ricoEntreprise from "../assets/rico-entreprise.png";
import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";

export default function FreeAndSchools() {
  return (
    <section id="ecoles" className="section section--stack free">
      <div className="free__grid">
        <Reveal className="card card--free">
          <img
            className="float"
            aria-hidden="true"
            src={coinImg}
            alt=""
            style={{ right: 30, top: 24, width: 104, "--r": "8deg", "--d": "5s" }}
          />
          <img
            className="float"
            aria-hidden="true"
            src={coinImg}
            alt=""
            style={{ right: 130, top: 78, width: 60, "--r": "-14deg", "--d": "6s", "--dl": "-2s" }}
          />
          <img
            className="float"
            aria-hidden="true"
            src={diamondImg}
            alt=""
            style={{ right: 44, top: 140, width: 52, "--d": "4.4s", "--dl": "-1s" }}
          />
          <h2 className="display">0 € pour toi.</h2>
          <p>Ce sont nos partenaires qui financent l’app. Toi, tu ne paies rien.</p>
        </Reveal>

        <Reveal className="card card--school" delay={120}>
          <span className="label" style={{ color: "#1F1A3A" }}>
            Lycées, écoles, missions locales
          </span>
          <h3 className="display">Tu accompagnes des jeunes ?</h3>
          <p>Cezame est gratuit pour eux. On t’aide à le lancer avec ton groupe.</p>
          <Button href="#" variant="white" arrow>
            Nous écrire
          </Button>
          <img className="card__rico" src={ricoEntreprise} alt="" />
        </Reveal>
      </div>
    </section>
  );
}
