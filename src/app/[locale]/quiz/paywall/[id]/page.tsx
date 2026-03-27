import PageComponent from './PageComponent';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'ColorLab' });
  return {
    title: `Unlock Your Seasonal Color Report | AI Color Lab`,
    description: "Discover your true colors. Get your personalized AI seasonal color analysis report.",
  }
}

export default function PaywallPage({
  params: { locale, id }
}: {
  params: { locale: string; id: string };
}) {
  return <PageComponent locale={locale} sessionId={id} />;
}
