import FadeUp from "@/components/FadeUp";
import { getBlogs, getNotionPageMarkdown } from "@/lib/integrations/notion";
import { Metadata } from "next";
import Link from "next/link";
import { RiArrowLeftLine, RiCalendarLine } from "react-icons/ri";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const blogsData = await getBlogs();
  const blog = blogsData?.find((b) => b.id === id);

  if (!blog) {
    return {
      title: "Post Not Found",
      description: "This blog post could not be found.",
    };
  }

  return {
    title: `${blog.title} | Adithya Krishnan`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      publishedTime: blog.date,
      authors: ["Adithya Krishnan"],
    },
    twitter: {
      title: blog.title,
      description: blog.excerpt,
      card: "summary_large_image",
    },
    alternates: {
      canonical: `https://www.adithyakrishnan.com/blogs/${blog.id}`,
    },
  };
}

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export default async function BlogIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const blogsData = await getBlogs();
  const blog = blogsData?.find((b) => b.id === id);

  if (!blog) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-black px-6 text-white">
        <div className="space-y-2 text-center">
          <h1 className="text-5xl font-light md:text-6xl">404</h1>
          <p className="text-white/50">Post not found.</p>
        </div>
        <Link
          href="/blogs"
          className="group mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50 transition-all hover:gap-3 hover:text-white"
        >
          <RiArrowLeftLine className="transition-transform group-hover:-translate-x-1" />
          Return to Blogs
        </Link>
      </main>
    );
  }

  const markdown = await getNotionPageMarkdown(id);
  const readingTime = calculateReadingTime(markdown || blog.excerpt || "");

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white selection:bg-white/30 md:px-24">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Header Navigation */}
        <FadeUp>
          <Link
            href="/blogs"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50 transition-all hover:gap-3 hover:text-white"
          >
            <RiArrowLeftLine className="transition-transform group-hover:-translate-x-1" />
            All Blogs
          </Link>
        </FadeUp>

        {/* Article Header */}
        <FadeUp>
          <div className="space-y-8 border-b border-white/10 pb-8">
            <div className="space-y-4">
              <h1 className="space-grotesk text-4xl font-light leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                {blog.title}
              </h1>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-white/40">
              <div className="flex items-center gap-2">
                <RiCalendarLine className="text-white/30" />
                <span>{blog.date}</span>
              </div>
              <span className="text-white/20">•</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </FadeUp>

        {/* Article Content */}
        <FadeUp>
          <article className="prose prose-invert max-w-none space-y-6 break-words prose-headings:font-light prose-headings:tracking-tight prose-h1:mb-4 prose-h1:mt-8 prose-h1:text-3xl prose-h1:text-white prose-h2:mb-4 prose-h2:mt-8 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-4 prose-h2:text-2xl prose-h2:text-white prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-xl prose-h3:text-white/90 prose-h4:mb-2 prose-h4:mt-4 prose-h4:text-lg prose-h4:text-white/80 prose-p:my-4 prose-p:text-base prose-p:leading-relaxed prose-p:text-white/70 prose-a:text-white prose-a:underline prose-a:decoration-white/30 prose-a:transition-all hover:prose-a:text-white/80 hover:prose-a:decoration-white/50 prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-white/20 prose-blockquote:bg-white/[0.02] prose-blockquote:py-1 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-white/60 prose-blockquote:prose-p:my-0 prose-strong:font-semibold prose-strong:text-white prose-em:italic prose-em:text-white/70 prose-code:rounded prose-code:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:text-white prose-code:before:content-none prose-code:after:content-none prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-white/10 prose-pre:bg-white/[0.04] prose-pre:p-4 prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-pre:prose-code:text-white/80 prose-ol:my-4 prose-ol:space-y-3 prose-ol:pl-6 prose-ol:text-white/70 prose-ul:my-4 prose-ul:space-y-3 prose-ul:pl-6 prose-ul:text-white/70 prose-li:my-0 prose-li:text-white/70 prose-li:marker:text-white/40 prose-table:my-6 prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-white/10 prose-table:text-sm prose-th:border prose-th:border-white/10 prose-th:bg-white/[0.03] prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-white/80 prose-td:border prose-td:border-white/10 prose-td:px-4 prose-td:py-2 prose-td:text-white/60 prose-img:my-6 prose-img:rounded-lg prose-img:border prose-img:border-white/10 prose-hr:my-8 prose-hr:border-white/10 prose-h1:md:text-4xl prose-h2:md:text-3xl prose-h3:md:text-2xl prose-p:md:text-lg">
            {markdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            ) : (
              <p>{blog.excerpt}</p>
            )}
          </article>
        </FadeUp>

        {/* Footer Navigation */}
        <FadeUp>
          <div className="border-t border-white/10 pt-8">
            <Link
              href="/blogs"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50 transition-all hover:gap-3 hover:text-white"
            >
              <RiArrowLeftLine className="transition-transform group-hover:-translate-x-1" />
              Back to Blogs
            </Link>
          </div>
        </FadeUp>
      </div>
    </main>
  );
}
