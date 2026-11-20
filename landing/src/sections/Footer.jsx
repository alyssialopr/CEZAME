import logo from "../assets/logo.png";
import { FOOTER_COLUMNS } from "../data.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <img src={logo} alt="Cezame" />
            <div className="display">Débloque la vie d’adulte.</div>
          </div>
          <div className="footer__cols">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="footer__col">
                <div className="display">{col.title}</div>
                {col.links.map((l) => (
                  <a key={l} href="#">
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 Cezame</span>
          <span>Fait avec Rico, en France</span>
        </div>
      </div>
    </footer>
  );
}
