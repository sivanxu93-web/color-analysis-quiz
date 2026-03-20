'use client';

import React from 'react';
import { useCommonContext } from "~/context/common-context";
import { useParams } from 'next/navigation';
import PricingContent from './PricingContent';

export default function Pricing({
  redirectUrl,
}: {
    redirectUrl?: string;
}) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  return (
    <section className="bg-[#FAF9F6] py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <PricingContent locale={locale} />
        
        <div className="mt-32 text-center border-t border-gray-100 pt-16">
            <p className="text-gray-400 font-serif italic text-sm md:text-base max-w-2xl mx-auto leading-relaxed opacity-80">
                &quot;The AI Style Validator saved me from buying a $200 coat that didn&apos;t match my season. This analysis is an investment that pays for itself immediately.&quot; — <span className="font-bold text-[#2D2D2D]">Elena R.</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-8 opacity-30 grayscale pointer-events-none">
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#2D2D2D]">Trusted by 10,000+ Style Seekers</span>
            </div>
        </div>
      </div>
    </section>
  );
}
