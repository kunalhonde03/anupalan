import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ANUPALAN | AICTE Obligation & Compliance Platform',
  description: 'Smart India Hackathon 2026 PS 26262 - The Obligation-Aware AICTE Approval & Compliance Monitoring Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
