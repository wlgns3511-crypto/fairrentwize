import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'FairRentWize privacy policy - how we handle your data and protect your privacy.',
  alternates: { canonical: '/privacy/' },
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <div className="prose prose-slate max-w-none text-sm">
        <p>Last updated: January 2026</p>
        <h2>Information We Collect</h2>
        <p>FairRentWize does not collect personal information. We use Google Analytics to understand website traffic patterns and Google AdSense to display advertisements. These services may use cookies.</p>
        <h2>Cookies</h2>
        <p>Third-party services (Google Analytics, Google AdSense) may place cookies on your device. You can manage cookie preferences in your browser settings.</p>
        <h2>Advertising</h2>
        <p>We use Google AdSense to serve ads. Google may use cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising by visiting Google Ads Settings.</p>
        <h2>Data Accuracy</h2>
        <p>While we strive for accuracy, rental market data is subject to change. FMR data is based on HUD estimates and may not reflect current market conditions in all areas.</p>
        <h2>Calculator Data</h2>
        <p>All calculations performed using our Rent Affordability Calculator are processed locally in your browser. No calculation data is transmitted to our servers.</p>
        <h2>Contact</h2>
        <p>For privacy inquiries, visit our <a href="/contact/" className="text-indigo-600 hover:underline">contact page</a>.</p>
      </div>
    </>
  );
}
