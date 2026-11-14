import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HawaSathi (हवासार्थी) — AI Civic Air Quality Briefing Studio',
  description: 'From Air Data to Local Action. An AI-powered civic environmental intelligence platform transforming messy municipal air sensor feeds into traceable findings, stakeholder-specific interventions, and multilingual citizen advisories.',
  keywords: ['AQI', 'Air Quality', 'Bhopal', 'Civic Tech', 'Gemini AI', 'Environmental Intelligence'],
  authors: [{ name: 'HawaSathi Team' }],
};

export const viewport: Viewport = {
  themeColor: '#07111F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F8FA] text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {/* WCAG AA Accessibility Skip to Main Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:font-semibold focus:text-xs"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
