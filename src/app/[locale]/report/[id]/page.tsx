import { getColorLabText } from '~/i18n/languageText';
import { getColorLabReport } from '~/servers/colorLab';
import PageComponent from './PageComponent';
import { Metadata } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "~/libs/authOptions";

export async function generateMetadata({ params: { id, locale } }: { params: { id: string, locale: string } }): Promise<Metadata> {
  const colorLabText = await getColorLabText();
  const data = await getColorLabReport(id);
  
  const baseUrl = 'https://coloranalysisquiz.app';
  // Use the generated card if it exists, otherwise use the high-quality seasonal hero image
  const shareImage = data?.shareCardUrl || `${baseUrl}/seasonal_color_analysis.jpg`;
  
  // Canonical should always point to the clean URL (no /en for default locale)
  const canonicalPath = locale === 'en' ? `/report/${id}` : `/${locale}/report/${id}`;
  const pageUrl = `${baseUrl}${canonicalPath}`;

  return {
    metadataBase: new URL(baseUrl),
    title: `My Color Analysis Result | ${colorLabText.Landing.title}`,
    description: "I just found my professional seasonal color palette using AI! Check yours for free.",
    alternates: {
        canonical: canonicalPath,
    },
    openGraph: {
        title: `My Style Identity: ${data?.report?.season || 'Seasonal Color Analysis'}`,
        description: "Discover your perfect colors with AI. Get your personal palette instantly.",
        url: pageUrl,
        siteName: 'Color Analysis Quiz',
        images: [
            {
                url: shareImage,
                width: 1200,
                height: 630,
                alt: 'My Seasonal Color Identity Card',
            }
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: `My Style Identity: ${data?.report?.season || 'Seasonal Color Analysis'}`,
        description: "I just found my professional seasonal color palette using AI!",
        images: [shareImage],
        creator: '@ColorQuizAI', // Feel free to update this to your new X handle
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
