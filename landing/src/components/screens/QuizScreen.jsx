// Écran de l'app reproduit pour la maquette du téléphone (LessonScreen).
import ricoEntrepriseDroit from "../../assets/rico-entreprise-droit.png";

export default function QuizScreen() {
  return (
    <div
      style={{
        padding: "36px 12px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "9px",
        height: "100%",
        boxSizing: "border-box",
        background: "#FBFAF8",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#AFAFB8", fontSize: "15px", fontWeight: "700", lineHeight: "1" }}>×</span>
        <div style={{ flex: "1", height: "8px", borderRadius: "6px", background: "#E7E7E7", overflow: "hidden" }}>
          <div style={{ width: "45%", height: "100%", borderRadius: "6px", background: "#A8EA73" }}></div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
            color: "#FF4B6E",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24">
            <path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z" fill="#FF4B6E" />
          </svg>
          5
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
        <div style={{ color: "#60646C", fontSize: "9.5px", fontWeight: "600" }}>Obligation déclarative</div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "3px 7px",
            borderRadius: "6px",
            background: "#EEF2FF",
            border: "1px solid #C7D2FE",
            color: "#4F46E5",
            fontSize: "8.5px",
            fontWeight: "700",
            flexShrink: "0",
          }}
        >
          <svg
            aria-hidden="true"
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6366F1"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Voir la leçon
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "2px 0" }}>
        <img src={ricoEntrepriseDroit} alt="" style={{ width: "42px", height: "42px", objectFit: "contain", flexShrink: "0" }} />
        <div
          style={{
            flex: "1",
            padding: "9px 10px",
            borderRadius: "13px",
            background: "#8BD0C6",
            color: "#0D2A2A",
            fontSize: "10px",
            fontWeight: "700",
            lineHeight: "1.3",
          }}
        >
          Doit-on déclarer ses impôts si l'on ne gagne rien ?
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 10px",
          borderRadius: "12px",
          background: "#EAF9E0",
          border: "2px solid #86D95B",
        }}
      >
        <span
          style={{
            flexShrink: "0",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#86D95B",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: "700",
          }}
        >
          A
        </span>
        <span style={{ color: "#000000", fontSize: "9.5px", fontWeight: "600", lineHeight: "1.3" }}>
          Oui, c'est obligatoire et ça donne ton avis d'imposition
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 10px",
          borderRadius: "12px",
          background: "#F0F0F3",
          border: "2px solid transparent",
        }}
      >
        <span
          style={{
            flexShrink: "0",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#E0E1E6",
            color: "#60646C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: "700",
          }}
        >
          B
        </span>
        <span style={{ color: "#000000", fontSize: "9.5px", fontWeight: "600", lineHeight: "1.3" }}>
          Non, c'est interdit sous 15 000 € par an
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 10px",
          borderRadius: "12px",
          background: "#F0F0F3",
          border: "2px solid transparent",
        }}
      >
        <span
          style={{
            flexShrink: "0",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#E0E1E6",
            color: "#60646C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: "700",
          }}
        >
          C
        </span>
        <span style={{ color: "#000000", fontSize: "9.5px", fontWeight: "600", lineHeight: "1.3" }}>Seulement après 40 ans</span>
      </div>

      <div
        style={{
          padding: "8px 10px",
          borderRadius: "12px",
          background: "#EFF3FF",
          color: "#3C3C43",
          fontSize: "9px",
          fontWeight: "500",
          lineHeight: "1.35",
        }}
      >
        <div style={{ color: "#3A5AE8", fontWeight: "700", marginBottom: "2px" }}>Explication</div>
        Même sans revenus, la déclaration te donne un avis d'imposition demandé partout.
      </div>

      <div
        style={{
          marginTop: "auto",
          padding: "10px",
          borderRadius: "12px",
          background: "#A8EA73",
          color: "#3A6F1E",
          textAlign: "center",
          fontSize: "10.5px",
          fontWeight: "700",
        }}
      >
        CONTINUER
      </div>
    </div>
  );
}
