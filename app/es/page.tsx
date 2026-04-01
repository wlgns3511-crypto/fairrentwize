import type { Metadata } from "next";
import { getAllStates } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "FairRentWize - Alquileres Justos de Mercado en EE.UU.",
  description: "Explore los alquileres justos de mercado del HUD para más de 3,000 condados y 400 áreas metropolitanas de EE.UU.",
  alternates: {
    canonical: "/es/",
    languages: { en: "/", es: "/es/", "x-default": "/" },
  openGraph: { url: "/es/" },
},
};

export default function HomeEs() {
  const states = getAllStates();

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Alquileres Justos de Mercado en EE.UU.
      </h1>
      <p className="text-slate-600 mb-2">
        Explore los datos de alquiler justo de mercado del HUD por estado y condado en los Estados Unidos.
      </p>
      <p className="text-xs text-slate-400 mb-8">
        <a href="/" className="text-indigo-500 hover:underline">English version</a>
      </p>

      <section>
        <h2 className="text-xl font-bold mb-4">Alquileres por Estado</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {states.map((s) => (
            <a
              key={s.slug}
              href={`/es/state/${s.slug}/`}
              className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-center"
            >
              <div className="font-medium text-sm">{s.state}</div>
              <div className="text-xs text-slate-500 mt-1">{formatCurrency(s.avg_rent_2br)}/mes</div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
