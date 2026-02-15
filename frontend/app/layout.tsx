import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Machi Mango - Inventory & Ordering System',
  description:
    'Centralized inventory and ordering management system for Machi Mango franchise network',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
