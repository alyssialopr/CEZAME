// Écran de l'app reproduit pour la maquette du téléphone (ScoreScreen).
import ricoJoy from "../../assets/rico-joy.png";

export default function StreakScreen() {
  return (
    <div
      style={{
        padding: "36px 12px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        height: "100%",
        boxSizing: "border-box",
        background: "#FBFAF8",
        position: "relative",
      }}
    >
      <img src={ricoJoy} alt="" style={{ width: "86px", height: "86px", objectFit: "contain" }} />

      <div
        style={{
          fontSize: "17px",
          fontWeight: "800",
          color: "#000000",
          letterSpacing: "-0.02em",
          lineHeight: "1.1",
        }}
      >
        FÉLICITATIONS !
      </div>

      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: "#FFFFFF",
          borderRadius: "14px",
          padding: "11px 10px",
          border: "2px solid #E5E5E5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const active = day < 5;
            const fill = active ? "#FF9600" : "#E5E5E5";
            return (
              <svg key={day} aria-hidden="true" width="21" height="21" viewBox="0 0 24 24">
                <path
                  d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.6 1.4-4.3 2.6-5.4.2 1.7 1 2.8 2.1 3.3C11.4 8.4 11 5.3 12 2z"
                  fill={fill}
                  stroke={fill}
                  strokeWidth="1.2"
                />
              </svg>
            );
          })}
        </div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#000000" }}>5 jours de suite</div>
      </div>

      <div style={{ display: "flex", gap: "8px", width: "100%" }}>
        <div
          style={{
            flex: "1",
            background: "#FFFFFF",
            borderRadius: "13px",
            padding: "9px 6px",
            border: "1.5px solid #E5E5E5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24">
            <path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z" fill="#FF4B6E" />
          </svg>
          <div style={{ fontSize: "9px", color: "#6B7280", fontWeight: "600" }}>Vies restantes</div>
          <div style={{ fontSize: "13px", color: "#111827", fontWeight: "800" }}>5/5</div>
        </div>
        <div
          style={{
            flex: "1",
            background: "#FFFFFF",
            borderRadius: "13px",
            padding: "9px 6px",
            border: "1.5px solid #E5E5E5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <svg
            aria-hidden="true"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
          <div style={{ fontSize: "9px", color: "#6B7280", fontWeight: "600" }}>Précision</div>
          <div style={{ fontSize: "13px", color: "#111827", fontWeight: "800" }}>100%</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#A5EFE3",
            border: "2px solid #1D8271",
            borderRadius: "999px",
            padding: "6px 12px",
            color: "#1D8271",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="#1D8271">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          +50 XP
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#E0F2FE",
            border: "2px solid #0284C7",
            borderRadius: "999px",
            padding: "6px 12px",
            color: "#0284C7",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="#0284C7">
            <path d="M6 3h12l4 6-10 12L2 9z" />
          </svg>
          +10 💎
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          width: "100%",
          padding: "10px",
          borderRadius: "12px",
          background: "#A8EA73",
          color: "#3A6F1E",
          textAlign: "center",
          fontSize: "10.5px",
          fontWeight: "800",
        }}
      >
        CONTINUER
      </div>
    </div>
  );
}
