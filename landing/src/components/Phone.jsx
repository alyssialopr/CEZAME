// Cadre de téléphone autour d'un écran de l'app.
export default function Phone({ children }) {
  return (
    <div className="phone">
      <div className="phone__notch" />
      {children}
    </div>
  );
}
