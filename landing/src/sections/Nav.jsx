import logo from "../assets/logo.png";
import Button from "../components/Button.jsx";
import { NAV_LINKS } from "../data.js";
import { useScrolled } from "../hooks/useScrolled.js";

export default function Nav() {
  const scrolled = useScrolled();
  return (
    <header className="nav-wrap">
      <div className={`nav ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#top" className="nav__logo">
          <img src={logo} alt="Cezame" />
        </a>
        <nav aria-label="Menu principal" className="nav__links hide-sm">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <Button href="#telecharger" size="sm">
          Télécharger
        </Button>
      </div>
    </header>
  );
}
