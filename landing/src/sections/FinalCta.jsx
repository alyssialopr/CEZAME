import ricoHappy from "../assets/rico-happy.png";
import keyImg from "../assets/key.svg";
import coinImg from "../assets/coin.svg";
import docImg from "../assets/doc.svg";
import houseImg from "../assets/house.svg";
import heartImg from "../assets/heart.svg";
import Reveal from "../components/Reveal.jsx";
import { PhoneStoreIcon, PlayStoreIcon } from "../components/icons.jsx";
import { Cloud, FloatingObject, Rays, Sparkle } from "../components/Floating.jsx";

const StoreButton = ({ icon, top, name, href = "#" }) => (
  <a href={href} className="store">
    {icon}
    <span>
      <small>{top}</small>
      <b>{name}</b>
    </span>
  </a>
);

export default function FinalCta() {
  return (
    <section id="telecharger" className="section--stack final">
      <Sparkle left="10%" top={120} size={18} duration={3} delay={0} />
      <Sparkle left="86%" top={90} size={22} duration={4} delay={1} />
      <Sparkle left="70%" top={200} size={12} duration={3.2} delay={2} />
      <Sparkle left="24%" top={240} size={12} duration={2.8} delay={0.6} />

      <div className="final__text">
        <Reveal as="h2" className="display">
          Cezame,
          <br />
          <em>ouvre-toi.</em>
        </Reveal>
        <p className="lead" style={{ maxWidth: 400, fontSize: 17 }}>
          Ta première leçon prend 5 minutes. Rico t’attend derrière la porte.
        </p>
        <div className="final__stores">
          <StoreButton icon={<PhoneStoreIcon />} top="Télécharger sur" name="App Store" />
          <StoreButton icon={<PlayStoreIcon />} top="Disponible sur" name="Google Play" />
        </div>
      </div>

      <div className="final__stage">
        <Rays />
        <img className="final__rico float" src={ricoHappy} alt="Rico" style={{ "--d": "5s" }} />
        <FloatingObject src={keyImg} width={91} rotate={-10} duration={5} delay={0} style={{ left: "4%", top: 60 }} />
        <FloatingObject src={coinImg} width={83} rotate={8} duration={6} delay={1} style={{ right: "6%", top: 30 }} />
        <FloatingObject src={docImg} width={76} rotate={-4} duration={6.4} delay={2} hideOnMobile style={{ left: "16%", top: 280 }} />
        <FloatingObject src={houseImg} width={83} rotate={4} duration={7} delay={3} hideOnMobile style={{ right: "14%", top: 270 }} />
        <FloatingObject src={heartImg} width={45} rotate={10} duration={4.6} delay={1.6} hideOnMobile style={{ right: "30%", top: 0 }} />
      </div>

      <div className="clouds" style={{ zIndex: 4 }} aria-hidden="true">
        <Cloud width={480} duration={12} style={{ left: "-8%", bottom: -80 }} />
        <Cloud width={496} duration={15} style={{ left: "26%", bottom: -100 }} />
        <Cloud width={512} duration={10} style={{ right: "-10%", bottom: -76 }} />
        <Cloud width={256} duration={13} opacity={0.9} style={{ left: "54%", bottom: -30 }} />
      </div>
    </section>
  );
}
