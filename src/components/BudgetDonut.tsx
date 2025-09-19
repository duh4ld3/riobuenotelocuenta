import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

type Props = {
  asignado: number;
  ejecutado: number; // acumulado
};

export default function BudgetDonut({ asignado, ejecutado }: Props) {
  const restante = Math.max(0, (asignado || 0) - (ejecutado || 0));
  const data = {
    labels: ["Ejecutado", "Restante"],
    datasets: [
      {
        data: [ejecutado || 0, restante],
        borderWidth: 0,
        backgroundColor: ["#1E8449", "#EAF4FB"],
        hoverBackgroundColor: ["#27AE60", "#EAF4FB"],
      },
    ],
  };
  const pct = asignado > 0 ? Math.round(((ejecutado || 0) / asignado) * 100) : 0;

  const options = {
    cutout: "70%" as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: {
        label: (ctx: any) => `${ctx.label}: ${ctx.parsed.toLocaleString("es-CL")}`,
      }},
    },
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 360, margin: "0 auto" }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        fontWeight: 800, color: "#1E8449"
      }}>
        {pct}%
      </div>
    </div>
  );
}
