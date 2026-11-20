import { useReveal } from "../hooks/useReveal.js";

// Apparition en fondu + glissement au défilement. `delay` en ms pour décaler une série.
export default function Reveal({ as: Tag = "div", delay = 0, className = "", style, children, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`} style={{ "--delay": `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
