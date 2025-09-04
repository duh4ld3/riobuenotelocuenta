import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { formatCLP } from '../lib/format';

interface Props {
  asignado: number;
  ejecutado: number;
}

/**
 * Renderiza un gráfico de dona que muestra el porcentaje de presupuesto
 * ejecutado frente al asignado. Utiliza Chart.js directamente sin
 * dependencias adicionales.
 */
const BudgetDonut: React.FC<Props> = ({ asignado, ejecutado }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const restante = Math.max(asignado - ejecutado, 0);
    const data = {
      labels: ['Ejecutado', 'Restante'],
      datasets: [
        {
          data: [ejecutado, restante],
          backgroundColor: ['#27AE60', '#374151'],
          hoverOffset: 4,
        },
      ],
    };
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                return `${label}: ${formatCLP(value)}`;
              },
            },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [asignado, ejecutado]);

  // Calcular porcentaje ejecutado
  const percent = asignado > 0 ? Math.round((ejecutado / asignado) * 100) : 0;

  return (
    <div className="relative h-56 w-full flex items-center justify-center">
      <canvas ref={canvasRef} className="h-full w-full"></canvas>
      {/* Texto central sobre el gráfico */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-semibold text-primary">{percent}%</span>
        <span className="text-xs text-gray-400">Ejecutado</span>
      </div>
    </div>
  );
};

export default BudgetDonut;