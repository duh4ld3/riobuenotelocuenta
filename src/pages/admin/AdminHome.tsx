export default function AdminHome() {
  return (
    <div className="space-y-8">
      {/* Resumen */}
      <section>
        <h2 className="text-slate-900 font-semibold mb-4">Resumen</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardStat title="Proyectos publicados" value="—" />
          <CardStat title="Proyectos en borrador" value="—" />
          <CardStat title="Última sincronización" value="—" />
        </div>
      </section>

      {/* Acciones rápidas */}
      <section className="grid gap-4 lg:grid-cols-2">
        <CardAction
          title="Gestionar proyectos"
          description="Crea, edita y publica avances con fotos y presupuesto."
          cta={{ to: "/admin/proyectos", label: "Ir a proyectos" }}
        />
        <CardAction
          title="Documentos"
          description="Subida de bases, resoluciones y actas (próximamente)."
          disabled
        />
      </section>
    </div>
  );
}

function CardStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function CardAction({
  title,
  description,
  cta,
  disabled,
}: {
  title: string;
  description: string;
  cta?: { to: string; label: string };
  disabled?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-white p-6 shadow-sm",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <h3 className="text-slate-900 font-semibold">{title}</h3>
      <p className="mt-1 text-slate-600 text-sm">{description}</p>

      {cta && !disabled && (
        <a
          href={cta.to}
          className="inline-flex mt-4 rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition"
        >
          {cta.label}
        </a>
      )}
    </div>
  );
}
