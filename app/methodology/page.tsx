import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Methodology",
  description: "Learn how FairRentWize collects, processes, and verifies fair market rent and rental affordability data.",
  alternates: { canonical: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        FairRentWize is committed to providing accurate, comprehensive, and up-to-date data.
        This page explains how we collect, process, and verify our information.
      </p>

      <h2>Data Sources</h2>
      <p>
        Our data is sourced from authoritative, publicly available databases including: <strong>HUD Fair Market Rents, Census ACS</strong>.
        We cross-reference multiple sources to ensure accuracy and completeness.
      </p>

      <h2>Data Collection Process</h2>
      <ol>
        <li><strong>Automated Ingestion</strong> &mdash; We use automated pipelines to regularly pull data from our primary sources, ensuring freshness and consistency.</li>
        <li><strong>Normalization</strong> &mdash; Raw data is cleaned, standardized, and structured into our unified database schema for easy comparison and analysis.</li>
        <li><strong>Cross-Validation</strong> &mdash; We compare data points across multiple sources to identify and resolve discrepancies.</li>
        <li><strong>Expert Review</strong> &mdash; Our editorial team reviews flagged entries and applies domain expertise to ensure quality.</li>
      </ol>

      <h2>Update Frequency</h2>
      <p>
        Our databases are updated <strong>monthly</strong> to reflect the latest available information.
        Each page displays a verification timestamp showing when the data was last confirmed.
      </p>

      <h2>Quality Assurance</h2>
      <ul>
        <li>Automated integrity checks run daily to detect anomalies</li>
        <li>User feedback is actively monitored and incorporated</li>
        <li>All data transformations are logged and auditable</li>
        <li>We maintain version history for all critical datasets</li>
      </ul>

      <h2>Limitations</h2>
      <p>
        While we strive for accuracy, our data reflects the most recent publicly available information
        and may not capture real-time changes. We encourage users to verify critical data points
        with primary sources for important decisions.
      </p>

      <h2>Contact</h2>
      <p>
        If you find inaccuracies or have suggestions for improvement, please 
        <a href="/contact">contact us</a>. We value community input in maintaining data quality.
      </p>
    </article>
  );
}
