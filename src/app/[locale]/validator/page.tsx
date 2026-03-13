import { getColorLabText } from '~/i18n/languageText';
import { Metadata } from 'next';
import PageComponent from './PageComponent';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const colorLabText = await getColorLabText();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  const pageUrl = locale === 'en' ? `${baseUrl}/validator` : `${baseUrl}/${locale}/validator`;

  return {
    title: colorLabText.Validator.seoTitle,
    description: colorLabText.Validator.seoDescription,
    alternates: {
        canonical: pageUrl
    }
  }
}

export default async function ValidatorPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const colorLabText = await getColorLabText();
  return <PageComponent locale={locale} colorLabText={colorLabText} />;
}

