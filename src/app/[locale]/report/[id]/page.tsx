import { getColorLabText } from '~/i18n/languageText';
import { getColorLabReport } from '~/servers/colorLab';
import PageComponent from './PageComponent';
import { Metadata } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "~/libs/authOptions";

export async function generateMetadata({ params: { id, locale } }: { params: { id: string, locale: string } }): Promise<Metadata> {
  const colorLabText = await getColorLabText();
  const data = await getColorLabReport(id);
  const shareImage = data?.shareCardUrl || 'https://coloranalysisquiz.app/website.png';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  const pageUrl = `${baseUrl}/${locale}/report/${id}`;

  return {
    title: `My Color Analysis Report | ${colorLabText.Landing.title}`,
    description: "I just found my professional seasonal color palette! Check yours for free.",
    alternates: {
        canonical: pageUrl,
    },
    openGraph: {
        title: `My Color Analysis Report | Color Analysis Quiz`,
        description: "I just found my professional seasonal color palette! Check yours for free.",
        url: pageUrl,
        images: [
            {
                url: shareImage,
                width: 1200,
                height: 630,
                alt: 'My Seasonal Color Result',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `My Color Analysis Report | Color Analysis Quiz`,
        description: "I just found my professional seasonal color palette! Check yours for free.",
        images: [shareImage],
    }
  }
}

export default async function ReportPage({
  params: { locale, id },
  searchParams
}: {
  params: { locale: string; id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const colorLabText = await getColorLabText();
  const isDemo = searchParams?.demo === 'true';
  let data;

  if (isDemo) {
      data = {
          report: null, // PageComponent handles mock report if null in demo mode
          status: 'draft', // Default, overridden by PageComponent logic
          imageUrl: null,
          drapingImages: { best: null, worst: null },
          rating: undefined,
          ownerEmail: 'demo@example.com'
      };
  } else {
      try {
        data = await getColorLabReport(id);
      } catch (error) {
        console.error("Failed to fetch report:", error);
        return <div>Report not found</div>;
      }
  }

  const session = await getServerSession(authOptions);

  if (!data) {
      return <div>Report not found</div> // Simple fallback
  }

  // In demo mode, treat as owner so all UI features are visible for testing
  const isOwner = isDemo || (session?.user?.email === data.ownerEmail);

  return (
    <PageComponent 
        locale={locale} 
        report={data.report} 
        status={data.status || (data.report ? 'completed' : 'draft')} 
        userImage={data.imageUrl}
        drapingImages={data.drapingImages}
        shareCardUrl={data.shareCardUrl}
        colorLabText={colorLabText} 
        sessionId={id}
        rating={data.rating}
        isOwner={isOwner}
    />
  )
}
