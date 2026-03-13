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
  return <PageComponent locale={locale} colorLabText={colorLabText} />;
}

