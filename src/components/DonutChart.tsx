import React from "react";

type Props = {
  /** porcentaje 0-100 */
  value: number;
  size?: number;
  stroke?: number;
};

export default function DonutChart({ value, size = 260, stroke = 20 }: Props) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const filled = (v / 100) * C;

  return (
    <div className="donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {/* Anillo base */}
          <circle
            r={r}
            fill="none"
            stroke="rgba(255,255,255,.08)"
            strokeWidth={stroke}
          />
          {/* Progreso */}
          <circle
            r={r}
            fill="none"
            stroke="url(#g)"
            strokeLinecap="round"
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${C - filled}`}
            transform="rotate(-90)"
          />
          {/* Gradiente */}
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#1E8449" />
              <stop offset="100%" stopColor="#27AE60" />
            </linearGradient>
          </defs>

          {/* Ícono / número */}
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={28}
            fontWeight={900}
            fill="#B7F8CF"
            y={-4}
          >
            {Math.round(v)}%
          </text>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="rgba(255,255,255,.8)"
            y={20}
          >
            Ejecutado
          </text>
        </g>
      </svg>
    </div>
  );
}
