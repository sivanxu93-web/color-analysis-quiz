import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { SEO_EXAMPLES, ExampleItem } from '~/libs/examples';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Analysis Examples & Sample Reports | AI Color Palette',
  description: 'Browse real color analysis results categorized by Spring, Summer, Autumn, and Winter. See how our AI determines seasonal color palettes.',
};

export default function ExamplesPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const categories: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

  return (
    <>
      <Header locale={locale} page={'examples'} />
      <main className="min-h-screen bg-[#FFFBF7] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1A1A2E] mb-6">
                Color Analysis Example Gallery
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our collection of real AI-generated color analysis reports. Choose a season to see specific palettes and styling guides.
            </p>
          </div>

          {categories.map((cat) => {
            const items = SEO_EXAMPLES.filter(ex => ex.category === cat);
            if (items.length === 0) return null;

            return (
              <section key={cat} className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-serif font-bold text-[#1A1A2E]">{cat} Palette Examples</h2>
                    <div className="h-px flex-1 bg-[#E8E1D9]"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {items.map((item) => (
                    <ExampleCard key={item.slug} item={item} locale={locale} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <Footer locale={locale} page={'examples'} />
    </>
  );
}

function ExampleCard({ item, locale }: { item: ExampleItem, locale: string }) {
  return (
    <Link 
      href={getLinkHref(locale, `examples/${item.slug}`)}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#E8E1D9] hover:-translate-y-1"
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
          <img src={item.imageUrl} alt={`${item.season} Example`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-xl font-serif font-bold leading-tight">
                  {item.season}
              </h3>
              <p className="text-xs opacity-80 mt-1 italic">&quot;{item.headline}&quot;</p>
          </div>
      </div>
      <div className="p-4 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">View Report</span>
          <span className="text-gray-300">&rarr;</span>
      </div>
    </Link>
  );
}
