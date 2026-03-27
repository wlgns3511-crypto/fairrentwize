import RentCalculator from '@/components/RentCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rent Affordability Calculator - Embeddable Widget',
  description: 'Embeddable rent affordability calculator widget. Calculate if rent is affordable based on income using the 30% rule.',
  robots: { index: false, follow: false },
};

export default function EmbedCalcPage() {
  return (
    <div className="p-4">
      <RentCalculator />
      <p className="text-center text-xs text-slate-400 mt-4">
        Powered by <a href="https://fairrentwize.com" className="text-indigo-500 hover:underline">FairRentWize</a>
      </p>
    </div>
  );
}
