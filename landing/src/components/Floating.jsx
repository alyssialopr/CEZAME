import cloudImg from "../assets/cloud.svg";
import starImg from "../assets/star.svg";

// Objet qui flotte. `depth` = force du déplacement quand la souris bouge (0 = fixe).
export function FloatingObject({ src, width, depth = 0, rotate = 0, duration = 5, delay = 0, hideOnMobile = false, style }) {
  return (
    <div className={`obj px ${hideOnMobile ? "hide-sm" : ""}`} aria-hidden="true" style={{ width, "--k": `${depth}px`, ...style }}>
      <img className="float" src={src} alt="" style={{ "--r": `${rotate}deg`, "--d": `${duration}s`, "--dl": `-${delay}s` }} />
    </div>
  );
}

export function Cloud({ width, duration = 10, opacity = 1, style }) {
  return <img className="cloud" aria-hidden="true" src={cloudImg} alt="" style={{ width, opacity, "--d": `${duration}s`, ...style }} />;
}

export function Sparkle({ left, top, size, duration = 3, delay = 0 }) {
  return (
    <img
      className="sparkle"
      aria-hidden="true"
      src={starImg}
      alt=""
      style={{ left, top, width: size, "--d": `${duration}s`, "--dl": `-${delay}s` }}
    />
  );
}

export function Rays() {
  return <div className="rays" aria-hidden="true" />;
}
