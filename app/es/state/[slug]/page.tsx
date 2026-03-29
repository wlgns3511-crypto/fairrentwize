import { getAllStates, getStateBySlug, getCountiesByState, getMetrosByState } from '@/lib/db';
import { formatCurrency, formatPercent } from '@/lib/format';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllStates().slice(0, 300).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  return {
    title: `Alquileres Justos de Mercado en ${state.state} 2026`,
    description: `Datos de alquiler justo de mercado de ${state.state}: 1 hab. ${formatCurrency(state.avg_rent_1br)}/mes, 2 hab. ${formatCurrency(state.avg_rent_2br)}/mes. Derechos del inquilino: ${state.tenant_rights_score}/10.`,
    alternates: {
      canonical: `/es/state/${slug}/`,
      languages: { en: `/state/${slug}/`, es: `/es/state/${slug}/`, "x-default": `/state/${slug}/` },
    },
  };
}

export default async function StatePageEs({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const counties = getCountiesByState(state.abbr);
  const metros = getMetrosByState(state.abbr);
  const affordableRent = Math.round(state.median_income * 0.3 / 12);
  const isAffordable = affordableRent >= state.avg_rent_2br;

  return (
    <>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/es/" className="hover:underline">Inicio</a> &raquo; <span>{state.state}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Alquileres Justos de Mercado en {state.state} 2026</h1>
      <p className="text-slate-600 mb-2">
        Datos de alquiler justo de mercado del HUD para {state.state} ({state.abbr}). Alquiler promedio 1 hab.: {formatCurrency(state.avg_rent_1br)}/mes. Alquiler promedio 2 hab.: {formatCurrency(state.avg_rent_2br)}/mes.
      </p>
      <p className="text-xs text-slate-400 mb-6">
        <a href={`/state/${slug}/`} className="text-indigo-500 hover:underline">English version</a>
      </p>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Alquiler Prom. 1 Hab.</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(state.avg_rent_1br)}/mes</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Alquiler Prom. 2 Hab.</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(state.avg_rent_2br)}/mes</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Ingreso Mediano</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(state.median_income)}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Derechos del Inquilino</p>
          <p className="text-xl font-bold text-indigo-700">{state.tenant_rights_score}/10</p>
        </div>
      </div>

      {/* Análisis de asequibilidad */}
      <div className={`rounded-lg p-4 mb-8 ${isAffordable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <h2 className="font-semibold mb-1">{isAffordable ? 'El Alquiler es Generalmente Asequible' : 'El Alquiler Puede Ser una Carga'}</h2>
        <p className="text-sm text-slate-700">
          Con un ingreso mediano de {formatCurrency(state.median_income)}/año, la regla del 30% sugiere gastar hasta {formatCurrency(affordableRent)}/mes en alquiler.
          El alquiler promedio de 2 hab. de {formatCurrency(state.avg_rent_2br)}/mes está {isAffordable ? 'dentro de' : 'por encima de'} este límite.
        </p>
      </div>

      {/* Estadísticas de inquilinos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Estadísticas de Inquilinos</h2>
        <p className="text-sm text-slate-600">{formatPercent(state.renter_pct)} de los hogares en {state.state} son inquilinos.</p>
      </div>

      {/* Áreas metropolitanas */}
      {metros.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Áreas Metropolitanas de {state.state}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2 pr-4">Área Metropolitana</th>
                  <th className="py-2 pr-4 text-right">Estudio</th>
                  <th className="py-2 pr-4 text-right">1 Hab.</th>
                  <th className="py-2 pr-4 text-right">2 Hab.</th>
                </tr>
              </thead>
              <tbody>
                {metros.map(m => (
                  <tr key={m.slug} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-4"><a href={`/metro/${m.slug}/`} className="text-indigo-600 hover:underline">{m.metro_name}</a></td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(m.fmr_studio)}</td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(m.fmr_1br)}</td>
                    <td className="py-2 pr-4 text-right font-medium">{formatCurrency(m.fmr_2br)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Condados */}
      {counties.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Condados de {state.state} - Alquileres Justos de Mercado</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2 pr-4">Condado</th>
                  <th className="py-2 pr-4 text-right">Estudio</th>
                  <th className="py-2 pr-4 text-right">1 Hab.</th>
                  <th className="py-2 pr-4 text-right">2 Hab.</th>
                  <th className="py-2 pr-4 text-right">Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {counties.map(c => (
                  <tr key={c.slug} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-4"><a href={`/county/${c.slug}/`} className="text-indigo-600 hover:underline">{c.county_name}</a></td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(c.fmr_studio)}</td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(c.fmr_1br)}</td>
                    <td className="py-2 pr-4 text-right font-medium">{formatCurrency(c.fmr_2br)}</td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(c.median_income)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="text-xs text-slate-400 mt-8">Fuente: HUD Fair Market Rents (FY 2026) y estimaciones del Census Bureau de EE.UU.</p>
    </>
  );
}
