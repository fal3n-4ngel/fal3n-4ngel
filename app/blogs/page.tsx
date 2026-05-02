import FadeUp from "@/components/FadeUp";
import { getBlogs } from "@/lib/integrations/notion";
import Link from "next/link";
import { RiArrowLeftLine, RiArrowRightUpLine, RiCalendarLine } from "react-icons/ri";

export const metadata = {
  title: "Writing | Adithya Krishnan",
  description:
    "Deep thoughts, questions, and random explorations. Ideas conceptualized by us, structured and polished by AI.",
  openGraph: {
    title: "Writing | Adithya Krishnan",
    description:
      "Deep thoughts, questions, and random explorations. Ideas conceptualized by us, structured and polished by AI.",
    type: "website",
  },
};

// Calculate reading time based on word count
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white selection:bg-white/30 md:px-24">
      <div className="mx-auto max-w-4xl space-y-16">
        {/* Header / Back Navigation */}
        <FadeUp>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50 transition-all hover:gap-3 hover:text-white"
          >
            <RiArrowLeftLine className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </FadeUp>

        {/* Page Header */}
        <FadeUp>
          <div className="space-y-6 border-b border-white/10 pb-8">
            <div>
              <h1 className="space-grotesk text-5xl font-light leading-none tracking-tight text-white md:text-7xl">
                Writing
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-white/60">
              Deep thoughts, candid questions, and random explorations from me and my friends. I
              generally brain-dump the core ideas and rants, while an AI helps structure and polish
              the final piece.
            </p>
          </div>
        </FadeUp>

        {/* Blogs List */}
        <div className="space-y-8">
          {!blogs || blogs.length === 0 ? (
            <FadeUp>
              <div className="flex items-center justify-center py-20">
                <div className="space-y-3 text-center">
                  <p className="font-mono text-sm text-white/40">No blogs published yet</p>
                  <p className="text-xs text-white/30">Check back soon for new content</p>
                </div>
              </div>
            </FadeUp>
          ) : (
            blogs.map((blog, idx) => {
              const readingTime = calculateReadingTime(blog.excerpt || "");
              return (
                <FadeUp key={idx}>
                  <Link href={`/blogs/${blog.id}`} className="group block">
                    <article className="relative flex flex-col gap-6 overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 transition-all duration-500 hover:border-white/30 hover:bg-gradient-to-br hover:from-white/[0.08] hover:to-white/[0.02] md:gap-8 md:p-10">
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-[100%] group-hover:opacity-50" />

                      {/* Content */}
                      <div className="relative z-10 space-y-6">
                        {/* Title and Icon */}
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <h2 className="text-2xl font-light leading-tight text-white transition-all group-hover:text-white/90 md:text-3xl lg:text-4xl">
                              {blog.title}
                            </h2>
                          </div>
                          <div className="mt-1 flex-shrink-0 rounded-full bg-white/5 p-2 transition-all duration-300 group-hover:bg-white group-hover:text-black md:p-3">
                            <RiArrowRightUpLine className="text-lg md:text-xl" />
                          </div>
                        </div>

                        {/* Excerpt */}
                        <p className="line-clamp-3 text-base leading-relaxed text-white/60 md:text-lg">
                          {blog.excerpt}
                        </p>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-xs text-white/50">
                          <div className="flex items-center gap-2">
                            <RiCalendarLine className="text-white/40" />
                            <span>{blog.date}</span>
                          </div>
                          <span className="text-white/30">•</span>
                          <span>{readingTime} min read</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </FadeUp>
              );
            })
          )}
        </div>

        {/* Footer divider */}
        <div className="border-t border-white/5 pt-8" />
      </div>
    </main>
  );
}
