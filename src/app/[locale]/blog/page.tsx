import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { blogPosts } from '~/libs/blogData';
import { getLinkHref } from '~/configs/buildLink';

export const metadata = {
  title: 'Color Analysis Blog | Tips, Guides & Trends',
  description: 'Learn everything about seasonal color analysis, DIY tests, and the latest trends in personal style.',
}

export default function BlogIndex({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <>
      <Header locale={locale} page={'blog'} />
      <main className="min-h-screen bg-background py-20 px-6">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4 text-text-primary">
                Color Analysis Blog
            </h1>
            <p className="text-center text-text-secondary mb-16 text-lg">
                Expert insights on finding your season and styling your palette.
            </p>

            <div className="grid gap-10">
                {blogPosts.map((post) => (
                    <article key={post.slug} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="text-sm text-gray-400 mb-2">{post.date}</div>
                        <h2 className="text-2xl font-serif font-bold mb-3 text-gray-900">
                            <Link href={getLinkHref(locale, `blog/${post.slug}`)} className="hover:text-primary transition-colors">
                                {post.title}
                            </Link>
                        </h2>
                        <p className="text-text-secondary mb-6 leading-relaxed">
                            {post.description}
                        </p>
                        <Link 
                            href={getLinkHref(locale, `blog/${post.slug}`)}
                            className="inline-flex items-center text-primary font-semibold hover:underline"
                        >
                            Read Article →
                        </Link>
                    </article>
                ))}
            </div>
        </div>
      </main>
      <Footer locale={locale} page={'blog'} />
    </>
  )
}
