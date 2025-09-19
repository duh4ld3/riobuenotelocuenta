import React from "react";
import type { MonthEntry } from "@/lib/types";
import { normalizeImageUrl, PLACEHOLDER } from "../lib/images";

function prettyMonth(m: string) {
  const [y, mo] = m.split("-").map(Number);
  const dt = new Date(y, (mo || 1) - 1, 1);
  return dt.toLocaleDateString("es-CL", { month: "short", year: "numeric" });
}

type Props = {
  months: MonthEntry[];
  activeIndex: number;
  onChange: (i: number) => void;
};

const MonthTabs: React.FC<Props> = ({ months, activeIndex, onChange }) => {
  // ordena meses ascendentes tipo 2025-07, 2025-08
  const sorted = React.useMemo(
    () => [...months].sort((a, b) => a.mes.localeCompare(b.mes)),
    [months]
  );

  return (
    <div className="flex gap-3 overflow-x-auto py-2">
      {sorted.map((m, i) => {
        const thumb =
          m.fotos?.[0]?.src ? normalizeImageUrl(m.fotos[0].src) : PLACEHOLDER;
        const originalIdx = months.indexOf(m); // mismas referencias
        const isActive = originalIdx === activeIndex;

        return (
          <button
            key={m.mes}
            onClick={() => onChange(originalIdx)}
            className={`flex items-center gap-2 rounded-xl2 border px-3 py-2 text-sm transition
              ${
                isActive
                  ? "bg-brand-gradient text-white border-transparent"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
          >
            <img
              src={thumb}
              alt={prettyMonth(m.mes)}
              className="w-10 h-10 rounded-md object-cover"
              loading="lazy"
              onError={(e) => {
                if (e.currentTarget.src !== PLACEHOLDER) {
                  e.currentTarget.src = PLACEHOLDER;
                }
              }}
            />
            <span className="text-sm font-medium whitespace-nowrap">
              {prettyMonth(m.mes)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MonthTabs;
