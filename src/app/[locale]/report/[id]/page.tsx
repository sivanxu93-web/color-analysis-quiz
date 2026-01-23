import { getColorLabText } from '~/i18n/languageText';
import { getColorLabReport } from '~/servers/colorLab';
import PageComponent from './PageComponent';
import { Metadata } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "~/libs/authOptions";

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
  const session = await getServerSession(authOptions);

  if (!data) {
      return <div>Report not found</div> // Simple fallback
  }

  const isOwner = session?.user?.email === data.ownerEmail;

  return (
    <PageComponent 
        locale={locale} 
        report={data.report} 
        userImage={data.imageUrl}
        drapingImages={data.drapingImages}
        colorLabText={colorLabText} 
        sessionId={id}
        rating={data.rating}
        isOwner={isOwner}
    />
  )
}
