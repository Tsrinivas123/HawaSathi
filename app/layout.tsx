import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HawaSathi — AI Civic Air Quality Briefing Studio',
  description: 'From Air Data to Local Action. An AI-powered civic environmental intelligence platform for local authorities, housing societies, and school administrators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F8FA] text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
