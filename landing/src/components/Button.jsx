import { ArrowIcon } from "./icons.jsx";

// variant : primary (violet), ghost (clair), white (blanc avec ombre). size : md | sm.
export default function Button({ href = "#", variant = "primary", size = "md", arrow = false, children, ...rest }) {
  const arrowColor = variant === "primary" ? "#FFFFFF" : "#1F1A3A";
  return (
    <a href={href} className={`btn btn--${variant} ${size === "sm" ? "btn--sm" : ""}`} {...rest}>
      {children}
      {arrow && <ArrowIcon color={arrowColor} />}
    </a>
  );
}
