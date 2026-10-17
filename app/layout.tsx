import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { asset } from '@/lib/site';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  metadataBase: new URL('https://salahu01.github.io'),
  title: 'Globber: block spam by its pattern',
  description:
    'Globber is a private, on-device Android call blocker. One pattern like +91 140* silences a whole series of spam numbers before your phone rings. No internet permission, no ads, no tracking.',
  icons: { icon: { url: asset('app/mark.svg'), type: 'image/svg+xml' } },
  openGraph: {
    title: 'Globber: block spam by its pattern',
    description: 'One rule silences an entire series of spam numbers. On-device, no internet, no ads.',
    images: ['/globber/assets/og.png'],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F7F4' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0B0A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
