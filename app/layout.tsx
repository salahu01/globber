import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Space_Grotesk, Unbounded } from 'next/font/google';
import { asset } from '@/lib/site';
import './globals.css';

const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-grotesk' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '800'], variable: '--font-mono' });
const unbounded = Unbounded({ subsets: ['latin'], weight: ['500', '800', '900'], variable: '--font-unbounded' });

export const metadata: Metadata = {
  metadataBase: new URL('https://salahu01.github.io'),
  title: 'Globber — block the shape of spam',
  description:
    'Globber is a private, on-device Android call blocker that blocks spam by pattern — prefixes, wildcards, regex — before your phone rings.',
  icons: { icon: { url: asset('glyph.svg'), type: 'image/svg+xml' } },
  openGraph: {
    title: 'Globber — block the shape of spam',
    description: 'Pattern-matching call blocker for Android. No internet permission. No ads. No tracking.',
    images: ['/Globber/assets/og.png'],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { themeColor: '#0a0c07' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable} ${unbounded.variable}`}>
      <body>{children}</body>
    </html>
  );
}
