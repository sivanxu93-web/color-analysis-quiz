import clsx from 'clsx';
import { Inter, Playfair_Display } from 'next/font/google';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import { locales } from '~/i18n/config';
import { CommonProvider } from '~/context/common-context';
import { NextAuthProvider } from '~/context/next-auth-context';
import { getAuthText, getCommonText, getMenuText, getPricingText } from "~/i18n/languageText";

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
      </body>
    </html>
  );
}