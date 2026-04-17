import { getColorLabText } from '~/i18n/languageText';
import { getColorLabReport } from '~/servers/colorLab';
import PageComponent from '../../report/[id]/PageComponent'; // Reuse existing component
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EXAMPLE_MAP } from '~/libs/examples';
import { getSeoText } from '~/libs/seoTexts';

// Mapping Slug -> UUID moved to src/libs/examples.ts

// SEO Metadata Generator
export async function generateMetadata({ params: { slug, locale } }: { params: { slug: string, locale: string } }): Promise<Metadata> {
  const prettyName = slug.replace('-analysis', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  const pageUrl = locale === 'en' ? `${baseUrl}/examples/${slug}` : `${baseUrl}/${locale}/examples/${slug}`;

  return {
    title: `${prettyName} Color Analysis — Your Complete Seasonal Palette Guide`,
    description: `See a professional ${prettyName} seasonal color analysis example. Explore the AI-generated power palette, makeup suggestions, and wardrobe guide.`,
    alternates: {
        canonical: pageUrl
    },
    openGraph: {
      title: `${prettyName} Color Analysis`,
      description: `See a professional ${prettyName} seasonal color analysis example.`,
      url: pageUrl,
      siteName: 'Color Analysis Quiz',
      images: [
        {
          url: `${baseUrl}/website.png`,
          width: 1200,
          height: 630,
          alt: `${prettyName} Color Analysis`,
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${prettyName} Color Analysis`,
      description: `See a professional ${prettyName} seasonal color analysis example.`,
      images: [`${baseUrl}/website.png`],
    }
  }
}

// Static Params for SSG (SEO Boost)
export async function generateStaticParams() {
  return Object.keys(EXAMPLE_MAP).map((slug) => ({ slug }));
}

export default async function ExamplePage({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string }
}) {
  const uuid = EXAMPLE_MAP[slug];
  if (!uuid) return notFound();

  const colorLabText = await getColorLabText();
  const data = await getColorLabReport(uuid);

  if (!data) {
      return <div>Example not found</div>
  }

  // Force isOwner=false so it looks like a public view (no feedback buttons, etc.)
  // Force status='completed' just in case
  const reportData = {
      ...data,
      status: 'completed'
  };

  const seoText = getSeoText(slug);

  return (
    <PageComponent 
        locale={locale} 
        report={reportData.report} 
        status={'completed'} 
        userImage={reportData.imageUrl}
        drapingImages={reportData.drapingImages}
        colorLabText={colorLabText} 
        sessionId={uuid} // Use UUID as session ID for logic, but isOwner is false
        rating={data.rating}
        isOwner={false}
        seoText={seoText}
    />
  )
}
