import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { getLinkHref } from '~/configs/buildLink';
import Link from 'next/link';

export default function ValidatorPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <>
      <Header locale={locale} page={'validator'} />
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
         <div className="max-w-3xl text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-accent-sage/30 text-green-800 text-sm font-semibold tracking-wide mb-6">
                🚧 Under Construction
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
               AI Style Validator <span className="text-primary">Coming Soon</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto">
               We are building a smart tool that will help you instantly check if a clothing item matches your seasonal color profile. Just upload a photo of the garment, and our AI will tell you if it's a "Match" or a "Clash".
            </p>
            
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto mb-10">
                <h3 className="text-xl font-serif font-bold mb-4 text-left">What to expect:</h3>
                <ul className="space-y-4 text-left">
                    <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">✓</span>
                        <span className="text-text-secondary"><strong>Instant Color Match:</strong> Upload any product photo or screenshot.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">✓</span>
                        <span className="text-text-secondary"><strong>Personalized Feedback:</strong> "This Emerald Green top harmonizes perfectly with your Deep Winter palette."</span>
                    </li>
                    <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">✓</span>
                        <span className="text-text-secondary"><strong>Outfit Advice:</strong> Get tips on how to style it if it's not a perfect match.</span>
                    </li>
                </ul>
            </div>

            <Link
                href={getLinkHref(locale, '')}
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-primary-hover transition-all transform hover:-translate-y-1"
            >
                Back to Color Analysis
            </Link>
         </div>
      </main>
      <Footer locale={locale} page={'validator'} />
    </>
  )
}
