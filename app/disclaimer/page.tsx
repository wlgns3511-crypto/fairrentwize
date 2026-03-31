import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer and limitations of liability for FairRentWize.",
  alternates: { canonical: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-700 mb-6">Disclaimer</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: March 25, 2026</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">General Information</h2>
      <p>
        The information provided on FairRentWize is for general informational and educational purposes only. While we
        strive to keep the information accurate and up to date, we make no representations or warranties of any
        kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Not Professional Advice</h2>
      <p>
        The content on this website does not constitute professional advice of any kind, including but not limited
        to financial, legal, medical, or career advice. Any reliance you place on the information is strictly at
        your own risk. Always consult with a qualified professional before making decisions based on the information
        found on this website.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Accuracy</h2>
      <p>
        Data displayed on FairRentWize is sourced from publicly available databases and third-party sources. While we
        make reasonable efforts to ensure accuracy, data may contain errors, be outdated, or have limitations.
        Users should independently verify critical information before making decisions based on it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">External Links</h2>
      <p>
        This website may contain links to external websites that are not under our control. We have no responsibility
        for the content, privacy policies, or practices of any third-party websites.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Advertising</h2>
      <p>
        FairRentWize displays third-party advertisements through Google AdSense and other ad networks. These advertisements
        are provided by third parties and do not imply endorsement by FairRentWize. We are not responsible for the content
        or accuracy of any advertisements displayed on this website.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of Liability</h2>
      <p>
        In no event shall FairRentWize, its owners, operators, or contributors be liable for any direct, indirect,
        incidental, consequential, or punitive damages arising from the use of this website or the information
        contained herein.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p>
        If you have concerns about any content on this website, please visit our{" "}
        <a href="/contact" className="text-slate-700 hover:underline">Contact page</a>.
      </p>
    </article>
  );
}
