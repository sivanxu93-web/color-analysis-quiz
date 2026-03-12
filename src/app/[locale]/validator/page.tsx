import { getColorLabText } from '~/i18n/languageText';
import { Metadata } from 'next';
import PageComponent from './PageComponent';

export async function generateMetadata(): Promise<Metadata> {
  const colorLabText = await getColorLabText();
  return {
    title: colorLabText.Validator.seoTitle,
    description: colorLabText.Validator.seoDescription,
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

