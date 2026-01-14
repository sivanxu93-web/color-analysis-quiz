import { getColorLabText } from '~/i18n/languageText';
import { getColorLabReport } from '~/servers/colorLab';
import PageComponent from './PageComponent';
import { Metadata } from 'next';

export async function generateMetadata({ params: { id } }: { params: { id: string } }): Promise<Metadata> {
  const colorLabText = await getColorLabText();
  return {
    title: `My Color Analysis Report | ${colorLabText.Landing.title}`,
    description: "Here is my personalized seasonal color palette.",
  }
}

export default async function ReportPage({
  params: { locale, id }
}: {
  params: { locale: string; id: string }
}) {
  const colorLabText = await getColorLabText();
  const data = await getColorLabReport(id);

  if (!data) {
      return <div>Report not found</div> // Simple fallback
  }

  return (
    <PageComponent 
        locale={locale} 
        report={data.report} 
        userImage={data.imageUrl}
        drapingImages={data.drapingImages}
        colorLabText={colorLabText} 
        sessionId={id}
    />
  )
}
