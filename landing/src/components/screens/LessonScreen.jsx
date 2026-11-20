// Écran de l'app reproduit pour la maquette du téléphone (HomeScreen + LessonPath).
import logo from "../../assets/logo.png";
import ricoEntreprise from "../../assets/rico-entreprise.png";

export default function LessonScreen() {
  return (
    <div style={{ background: "#F6F5F8", height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "36px 12px 10px",
          background: "#F6F5F8",
          borderBottom: "1px solid #E7E7E7",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <img src={logo} alt="" style={{ height: "20px" }} />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "10px",
              background: "#EDE7FF",
              color: "#7C4DFF",
              fontSize: "9.5px",
              fontWeight: "700",
            }}
          >
            <svg
              aria-hidden="true"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7C4DFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Thèmes
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", fontWeight: "800" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: "#FF9800" }}>
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24">
              <path
                d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.6 1.4-4.3 2.6-5.4.2 1.7 1 2.8 2.1 3.3C11.4 8.4 11 5.3 12 2z"
                fill="#FF9800"
              />
            </svg>
            7
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: "#29B6F6" }}>
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24">
              <path d="M6 3h12l4 6-10 12L2 9z" fill="#29B6F6" />
              <path d="M2 9h20M8 3l4 18M16 3l-4 18" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" fill="none" />
            </svg>
            510
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: "#FF4B6E" }}>
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24">
              <path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z" fill="#FF4B6E" />
            </svg>
            5
          </span>
        </div>
      </div>

      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div
          style={{
            borderRadius: "18px",
            background: "#8FA6FF",
            border: "2.5px solid #607FE8",
            padding: "11px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "6px",
          }}
        >
          <div style={{ flex: "1", minWidth: "0" }}>
            <span
              style={{
                display: "inline-block",
                padding: "3px 8px",
                borderRadius: "9px",
                background: "rgba(255,255,255,0.65)",
                color: "#1E1E24",
                fontSize: "8.5px",
                fontWeight: "800",
              }}
            >
              Unité 1 : Statut fiscal &amp; citoyen
            </span>
            <div
              style={{
                color: "#1A191E",
                fontSize: "12.5px",
                fontWeight: "800",
                lineHeight: "1.22",
                marginTop: "6px",
              }}
            >
              Rattachement parental et premier numéro fiscal
            </div>
            <span
              style={{
                display: "inline-block",
                marginTop: "6px",
                padding: "2px 7px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.08)",
                color: "#2D2B33",
                fontSize: "8.5px",
                fontWeight: "700",
              }}
            >
              ✨ 50 XP par leçon
            </span>
          </div>
          <div
            style={{
              position: "relative",
              width: "58px",
              height: "58px",
              flexShrink: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.4)",
              }}
            />
            <img src={ricoEntreprise} alt="" style={{ position: "relative", width: "56px", height: "56px", objectFit: "contain" }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", paddingTop: "2px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: "translateX(-16px)" }}>
            <div
              style={{
                padding: "3px 9px",
                borderRadius: "8px",
                background: "#FFFFFF",
                border: "2px solid #E4E1EE",
                color: "#607FE8",
                fontSize: "9px",
                fontWeight: "800",
                marginBottom: "5px",
              }}
            >
              COMMENCER
            </div>
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                background: "#8FA6FF",
                borderBottom: "5px solid #607FE8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }}
            >
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "2px 0" }}>
            <div
              style={{
                flex: "1",
                borderRadius: "14px",
                border: "2px solid #607FE8",
                background: "#FFFFFF",
                padding: "7px 9px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ color: "#607FE8", fontSize: "8px", fontWeight: "800", letterSpacing: "0.04em" }}>
                💡 CONSEIL DE RICO
              </div>
              <div style={{ color: "#0F172A", fontSize: "10px", fontWeight: "800", marginTop: "1px" }}>
                Conseil CAF
              </div>
              <div style={{ color: "#475569", fontSize: "9px", fontWeight: "500", lineHeight: "1.3", marginTop: "1px" }}>
                Déclare tout changement de situation dans le mois.
              </div>
            </div>
            <img src={ricoEntreprise} alt="" style={{ width: "44px", height: "44px", objectFit: "contain", flexShrink: "0" }} />
          </div>

          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#E2E8F0",
              borderBottom: "4px solid #CBD5E1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
