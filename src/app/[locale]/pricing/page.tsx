import PageComponent from "./PageComponent";
import { setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { getSeoAlternates } from '~/libs/seo';

export async function generateMetadata({ params: { locale = '' } }: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: 'Color Analysis Pricing Plans | AI Personal Color Lab',
    description: 'Choose the best plan for your seasonal color analysis. Get professional AI-generated power palettes, makeup guides, and wardrobe recommendations.',
    alternates: getSeoAlternates('/pricing', locale),
  }
}

export default async function IndexPage({ params: { locale = '' } }) {
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <PageComponent
      locale={locale}
    />
  )
}
