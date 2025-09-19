import React from "react";

type Props = { groups: { mes: string; urls: string[] }[] };

export default function MonthlyCarousel({ groups }: Props) {
  const [tab, setTab] = React.useState(0);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => { setIdx(0); }, [tab]);
  if (!groups.length) return null;

  const active = groups[tab];
  const hasMany = active.urls.length > 1;

  return (
    <section className="detail-card">
      <h3>Avances por mes</h3>
      <div className="chips" style={{ marginBottom: 12 }}>
        {groups.map((g, i) => (
          <button
            key={g.mes}
            onClick={() => setTab(i)}
            className={"chip " + (i === tab ? "chip--estado-en-progreso" : "")}
          >
            {g.mes}
          </button>
        ))}
      </div>

      <div className="hero" style={{ aspectRatio: "16/9", borderRadius: 12, overflow: "hidden" }}>
        <img src={active.urls[idx]} alt={`${active.mes} foto ${idx+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
      </div>

      {hasMany && (
        <div className="thumbs">
          {active.urls.map((u, i) => (
            <button key={u+i} className={i===idx?"is-active":""} onClick={() => setIdx(i)}>
              <img src={u} alt={`Mini ${i+1}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
