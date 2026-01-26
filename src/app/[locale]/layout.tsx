import clsx from 'clsx';
import { Inter, Playfair_Display } from 'next/font/google';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import { locales } from '~/i18n/config';
import { CommonProvider } from '~/context/common-context';
import { NextAuthProvider } from '~/context/next-auth-context';
import { getAuthText, getCommonText, getMenuText, getPricingText } from "~/i18n/languageText";
import { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import MicrosoftClarity from '~/components/MicrosoftClarity';

// Font Setup: Inter for Body, Playfair Display for Headings
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: 'Color Analysis Quiz | Discover Your Seasonal Palette with AI',
      template: '%s | Color Analysis Quiz'
    },
    description: 'Professional AI personal color analysis. Upload your photo to find your seasonal color palette (Spring, Summer, Autumn, Winter) and get style advice.',
    keywords: ['color analysis', 'seasonal color analysis', 'personal color analysis', 'ai color analysis', 'virtual draping'],
    openGraph: {
      type: 'website',
      siteName: 'Color Analysis Quiz',
      title: 'AI Color Analysis Quiz',
      description: 'Discover your seasonal color palette instantly with AI.',
      images: [
        {
          url: '/seasonal_color_analysis.jpg',
          width: 1200,
          height: 630,
          alt: 'Seasonal Color Analysis AI',
        }
      ],
      locale: locale
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AI Color Analysis Quiz',
      description: 'Discover your seasonal color palette instantly with AI.',
      images: ['/seasonal_color_analysis.jpg'],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': `${baseUrl}/en`,
        'zh': `${baseUrl}/zh`,
      }
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/appicon.svg',
      apple: '/appicon.svg',
    }
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Enable static rendering
  setRequestLocale(locale);

  const commonText = await getCommonText();
  const authText = await getAuthText();
  const menuText = await getMenuText();
  const pricingText = await getPricingText();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body suppressHydrationWarning={true} className={clsx('flex flex-col min-h-screen bg-[#FFFBF7] text-[#1A1A2E]')}>
        <NextAuthProvider>
          <CommonProvider
            commonText={commonText}
            authText={authText}
            menuText={menuText}
            pricingText={pricingText}
          >
            {children}
          </CommonProvider>
        </NextAuthProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || ""} />
        <MicrosoftClarity />
      </body>
    </html>
  );
}