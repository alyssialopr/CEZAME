import React, { useMemo } from "react";
import QRCode from "qrcode";
import { theme } from "../theme";

export const QrCodeCard: React.FC<{
  url: string;
  size?: number;
}> = ({ url, size = 310 }) => {
  const matrix = useMemo(() => {
    const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
    const count = qr.modules.size;
    const data = qr.modules.data;
    const cells: { x: number; y: number }[] = [];
    for (let y = 0; y < count; y++) {
      for (let x = 0; x < count; x++) {
        if (data[y * count + x]) {
          cells.push({ x, y });
        }
      }
    }
    return { count, cells };
  }, [url]);

  return (
    <div
      style={{
        padding: 26,
        borderRadius: 36,
        background: "#FFFFFF",
        boxShadow: `0 24px 70px rgba(0,0,0,0.45), 0 0 55px ${theme.colors.glow}`,
        border: "3px solid rgba(255,255,255,0.85)",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${matrix.count} ${matrix.count}`}
        shapeRendering="crispEdges"
      >
        <rect width={matrix.count} height={matrix.count} fill="#FFFFFF" />
        {matrix.cells.map((c, idx) => (
          <rect
            key={idx}
            x={c.x}
            y={c.y}
            width={1}
            height={1}
            fill={theme.colors.ink}
          />
        ))}
      </svg>
    </div>
  );
};
