import { getColorLabText } from '~/i18n/languageText';
import PageComponent from './PageComponent';
import { Metadata } from 'next';
import { getSeoAlternates, getSeoImages } from '~/libs/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const colorLabText = await getColorLabText();
  const title = `${colorLabText.Analysis.title} | AI Color Analysis Quiz`;
  const description = "Upload your photo for a free AI seasonal color analysis. Get your personalized palette in seconds with our advanced AI Stylist.";
  
  return {
    title,
    description,
    keywords: ['free color analysis', 'upload photo for color analysis', 'ai stylist', 'seasonal palette test'],
    alternates: getSeoAlternates('/analysis', locale),
    openGraph: {
      title,
      description,
      images: getSeoImages(),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/seasonal_color_analysis.jpg'],
    }
  }
}

export default async function AnalysisPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const colorLabText = await getColorLabText();
  return (
    <PageComponent locale={locale} colorLabText={colorLabText} />
  )
}
