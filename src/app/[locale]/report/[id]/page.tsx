import { getColorLabText } from '~/i18n/languageText';
import { getColorLabReport } from '~/servers/colorLab';
import PageComponent from './PageComponent';
import { Metadata } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "~/libs/authOptions";
import { getSeoAlternates, getSeoImages } from '~/libs/seo';
import { redirect } from 'next/navigation';
import { getLinkHref } from '~/configs/buildLink';

export async function generateMetadata({ params: { id } }: { params: { id: string, locale: string } }): Promise<Metadata> {
  const data = await getColorLabReport(id);
  
  const baseUrl = 'https://coloranalysisquiz.app';
  const shareImage = data?.shareCardUrl || `${baseUrl}/seasonal_color_analysis.jpg`;
  const pageUrl = `${baseUrl}/report/${id}`;

  return {
    title: `Style Identity: ${data?.report?.season || 'Color Analysis'}`,
    description: "Get your professional seasonal color palette using AI instantly.",
    alternates: { canonical: pageUrl },
    openGraph: {
        title: `My Style Identity: ${data?.report?.season || 'Seasonal Color'}`,
        description: "Discover your perfect colors with AI.",
        url: pageUrl,
        images: [{ url: shareImage, width: 1200, height: 630 }],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: `My Style Identity: ${data?.report?.season || 'Color Analysis'}`,
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
  const fromQuiz = searchParams?.from_quiz === 'true';
  let data;

  if (isDemo) {
      data = {
          report: null, 
          status: 'draft', 
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
      return <div>Report not found</div> 
  }

  const currentStatus = data.status || (data.report ? 'completed' : 'draft');
  const paymentSuccess = searchParams?.payment_success === 'true';

  // REDIRECT TO PAYWALL IF DRAFT (Not Paid/Analyzed Yet)
  // Only redirect if it's literally 'draft' or 'created', not in any progressing state, and not just returned from payment
  if ((currentStatus === 'draft' || currentStatus === 'created') && !isDemo && !fromQuiz && !paymentSuccess) {
      redirect(`/${locale}/quiz/paywall/${id}`);
  }

  return (
    <PageComponent 
        locale={locale} 
        report={data.report} 
        status={currentStatus} 
        userImage={data.imageUrl}
        drapingImages={data.drapingImages}
        shareCardUrl={data.shareCardUrl}
        colorLabText={colorLabText} 
        sessionId={id}
        rating={data.rating}
        ownerEmail={data.ownerEmail}
    />
  )
}
