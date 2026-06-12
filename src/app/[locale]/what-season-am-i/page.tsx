import PageComponent from './PageComponent';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  const pageUrl = locale === 'en' ? `${baseUrl}/what-season-am-i` : `${baseUrl}/${locale}/what-season-am-i`;

  return {
    title: `What Season Am I? Take the AI Color Analysis Test`,
    description: `Stop wondering 'what season am I'. Take our professional AI color analysis quiz to discover your exact 12-season palette, best colors, and makeup shades.`,
    alternates: {
        canonical: pageUrl
    }
  }
}

export default function WhatSeasonAmIPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  const pageUrl = locale === 'en' ? `${baseUrl}/what-season-am-i` : `${baseUrl}/${locale}/what-season-am-i`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can my season change if I get a tan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Your season is determined by your genetic undertone and natural contrast levels. A tan may deepen your overtone, but it does not change your core season (e.g., a Soft Summer remains a Soft Summer even with a tan)."
        }
      },
      {
        "@type": "Question",
        "name": "What if I dye my hair?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dyeing your hair can throw off your natural harmony if the dye color belongs to a different season. This is why our AI requires you to state your natural hair color during the quiz to ensure accurate analysis."
        }
      },
      {
        "@type": "Question",
        "name": "Is the AI better than a human consultant?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI is objective. It doesn't get tricked by yellow lighting in your bathroom or subjective preferences. While human consultants offer a great in-person experience, AI provides mathematical precision for a fraction of the cost."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "What Season Am I",
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageComponent locale={locale} />
    </>
  );
}
