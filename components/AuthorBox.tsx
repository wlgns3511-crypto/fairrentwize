export function AuthorBox() {
  return (
    <div className="mt-10 flex gap-4 p-5 bg-purple-50 border-purple-200 border rounded-xl">
      <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
        <span>🏘️</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-slate-900 text-sm">FairRentWize Research Team</span>
          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">Housing Market & Rental Data Analysts</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          Our housing economists track HUD Fair Market Rents, rental affordability indexes, and landlord-tenant law data across all US metropolitan areas. Updated annually from HUD FMR surveys.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">✓ HUD FMR Sourced</span>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">✓ All Metro Areas</span>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">✓ Tenant Law Verified</span>
        </div>
      </div>
    </div>
  );
}
