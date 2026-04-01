import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'FairRentWize privacy policy - how we handle your data and protect your privacy.',
  alternates: { canonical: '/privacy/' },
  openGraph: { url: "/privacy/" },
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
        <p>We use Google AdSense to serve ads. Google may use cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. You can also opt out of third-party vendor cookies at <a href="https://www.aboutads.info/choices/" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</p>
        <h2>Data Accuracy</h2>
        <p>While we strive for accuracy, rental market data is subject to change. FMR data is based on HUD estimates and may not reflect current market conditions in all areas.</p>
        <h2>Calculator Data</h2>
        <p>All calculations performed using our Rent Affordability Calculator are processed locally in your browser. No calculation data is transmitted to our servers.</p>
        <h2>Contact</h2>
        <p>For privacy inquiries, visit our <a href="/contact/" className="text-indigo-600 hover:underline">contact page</a>.</p>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h2 className="text-xl font-semibold mb-3">Part of DataPeek Facts Network</h2>
        <p>
          FairRentWize is part of the{" "}
          <a href="https://datapeekfacts.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            DataPeek Facts
          </a>{" "}
          network of free US data tools. For general inquiries about our data network, privacy practices, or partnership
          opportunities, please contact the DataPeek Facts team at{" "}
          <a href="mailto:datapeekfacts@gmail.com" className="text-blue-600 hover:underline">
            datapeekfacts@gmail.com
          </a>
          . You can also visit the{" "}
          <a href="https://datapeekfacts.com/privacy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            DataPeek Facts Privacy Policy
          </a>{" "}
          for network-wide privacy information.
        </p>
      </div>
    </>
  );
}
