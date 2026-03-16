import { getColorLabText } from '~/i18n/languageText';
import { Metadata } from 'next';
import PageComponent from './PageComponent';
import { getSeoAlternates } from '~/libs/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const colorLabText = await getColorLabText();

  return {
    title: colorLabText.Validator.seoTitle,
    description: colorLabText.Validator.seoDescription,
    alternates: getSeoAlternates('/validator', locale),
  }
}

export default async function ValidatorPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const colorLabText = await getColorLabText();
  
  return (
    <>
      {/* SSR Fallback for AI Crawlers */}
      <h1 className="sr-only">AI Style Validator - Check Your Outfit Color Match</h1>
      <p className="sr-only">
        {colorLabText.Validator.seoDescription || "Upload a photo of your clothing to see if its color matches your personal 12-season palette. Our AI Style Validator instantly tells you if an outfit is a match or a clash for your skin tone."}
      </p>
      
      <PageComponent locale={locale} colorLabText={colorLabText} />
    </>
  );
}

