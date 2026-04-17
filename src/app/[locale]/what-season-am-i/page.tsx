import PageComponent from './PageComponent';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  const pageUrl = locale === 'en' ? `${baseUrl}/what-season-am-i` : `${baseUrl}/${locale}/what-season-am-i`;

  return {
    title: `What Season Am I? Take the AI Color Analysis Test`,
    description: `Stop wondering 'what season am I'. Take our free AI color analysis quiz to discover your exact 12-season palette, best colors, and makeup shades.`,
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
  return <PageComponent locale={locale} />
}
