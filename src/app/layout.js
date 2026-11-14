import { Archivo, IBM_Plex_Mono, Lora, Manrope } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
});

// Keep the original crisp, condensed numerals and technical labels.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
  preload: false,
});

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Nirmaan Sena — Turnkey construction & interiors in Jaipur',
    template: '%s — Nirmaan Sena',
  },
  description: site.description,
  applicationName: 'Nirmaan Sena',
  openGraph: {
    type: 'website',
    siteName: 'Nirmaan Sena',
    locale: 'en_IN',
    title: 'Nirmaan Sena — Turnkey construction & interiors in Jaipur',
    description: site.description,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Nirmaan Sena' }],
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: '#f5f2eb',
  width: 'device-width',
  initialScale: 1,
};

// Marks the page as JS-enabled (enables reveal animations). If the app hasn't
// started within 4 seconds (slow network or an error), everything is shown anyway.
const bootScript =
  "document.documentElement.classList.add('js');setTimeout(function(){if(!window.__nsMotion)document.documentElement.classList.remove('js')},4000)";

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${manrope.variable} ${lora.variable} ${archivo.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
