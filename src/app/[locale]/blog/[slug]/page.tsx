import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { getBlogPost } from '~/libs/blogData';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | Color Analysis Quiz`,
    description: post.description,
  }
}

export default function BlogPost({
  params: { locale, slug }
}: {
  params: { locale: string, slug: string }
}) {
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Header locale={locale} page={'blog'} />
      <main className="min-h-screen bg-background py-20 px-6">
        <article className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <div className="mb-8">
                <Link href={getLinkHref(locale, 'blog')} className="text-sm text-gray-400 hover:text-primary mb-4 inline-block">
                    ← Back to Blog
                </Link>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">
                    {post.title}
                </h1>
                <p className="text-sm text-gray-400">Published on {post.date}</p>
            </div>

            <div 
                className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-p:text-text-secondary prose-a:text-primary max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-16 pt-10 border-t border-gray-100 text-center">
                <h3 className="text-2xl font-serif font-bold mb-4">Ready to find your season?</h3>
                <p className="text-text-secondary mb-8">Skip the guesswork and let our AI analyze your features in seconds.</p>
                <Link
                    href={getLinkHref(locale, '')}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-primary-hover transition-all transform hover:-translate-y-1"
                >
                    Take the Free Quiz
                </Link>
            </div>
        </article>
      </main>
      <Footer locale={locale} page={'blog'} />
    </>
  )
}
