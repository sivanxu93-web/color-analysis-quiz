import { getColorLabText } from '~/i18n/languageText';
import { Metadata } from 'next';
import PageComponent from './PageComponent';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Style Validator | Check Your Clothing Colors',
    description: 'Upload a clothing item to see if it matches your seasonal color profile.',
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

