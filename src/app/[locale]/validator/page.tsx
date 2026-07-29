import { getColorLabText } from '~/i18n/languageText';
import { Metadata } from 'next';
import PageComponent from './PageComponent';

import { getSeoAlternates } from '~/libs/seo';

export async function generateMetadata({ params: { locale = '' } }: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: 'Color Test for Clothes & Style Validator | Color Analysis Quiz',
    description: 'Take a free online color test for clothes. Upload a photo of any garment to see if it matches your seasonal color palette profile instantly.',
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

