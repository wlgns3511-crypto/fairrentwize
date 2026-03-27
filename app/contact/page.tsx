import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact FairRentWize for questions, feedback, or data inquiries about US fair market rents.',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <div className="prose prose-slate max-w-none">
        <p>Have questions about fair market rents, rental affordability, or our data? We would love to hear from you.</p>
        <h2>Get in Touch</h2>
        <ul>
          <li>Data questions or corrections</li>
          <li>Partnership inquiries</li>
          <li>Media and press requests</li>
          <li>Technical issues</li>
        </ul>
        <p>Email: <strong>hello@fairrentwize.com</strong></p>
        <h2>Data Sources</h2>
        <p>Our data is primarily sourced from:</p>
        <ul>
          <li>U.S. Department of Housing and Urban Development (HUD) Fair Market Rents</li>
          <li>U.S. Census Bureau American Community Survey</li>
          <li>Bureau of Labor Statistics</li>
        </ul>
        <p>If you believe any data is inaccurate, please let us know and we will investigate promptly.</p>
      </div>
    </>
  );
}
