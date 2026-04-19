import FadeUp from "@/components/FadeUp";
import { getBlogs } from "@/lib/integrations/notion";
import Link from "next/link";
import { RiArrowLeftLine, RiArrowRightUpLine } from "react-icons/ri";

export const metadata = {
  title: "Writing | Adithya Krishnan",
  description: "Deep Thoughts, questions, and random bullshits me and my friends think of",
  openGraph: {
    title: "Writing | Adithya Krishnan",
    description: "Deep Thoughts, questions, and random bullshits me and my friends think of",
    type: "website",
  },
};

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <main className="min-h-screen bg-[#000000] px-6 py-24 text-white selection:bg-white/30 md:px-24">
      <div className="mx-auto max-w-4xl space-y-16">
        {/* Header / Back Navigation */}
        <FadeUp>
          <div className="flex w-fit items-center gap-4 text-white/50 transition-colors hover:text-white">
            <Link
              href="/"
              className="group flex items-center gap-2 font-mono text-sm uppercase tracking-widest"
            >
              <RiArrowLeftLine className="transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
          </div>
        </FadeUp>

        <FadeUp>
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Writing</h1>
            <p className="mt-4 max-w-2xl font-sans text-lg text-white/60">
              Deep Thoughts, questions, and random bullshits me and friends think of. All the blogs
              are written by an llm since I am lazy to type everything , I jusst rant the main idea
              rest of the formatting and writing is done by the llm.
            </p>
          </div>
        </FadeUp>

        {/* Blogs List */}
        <div className="space-y-12">
          {!blogs || blogs.length === 0 ? (
            <div className="font-mono text-sm text-white/40">
              No blogs published yet. Check back soon.
            </div>
          ) : (
            blogs.map((blog, idx) => (
              <FadeUp key={idx}>
                <Link href={`/blogs/${blog.id}`} className="group block">
                  <article className="relative space-y-3 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-white/10 hover:bg-white/[0.05]">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/5 to-white/0 transition-transform duration-1000 group-hover:translate-x-[100%]" />

                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-2xl font-semibold text-white/90 transition-colors group-hover:text-white">
                        {blog.title}
                      </h2>
                      <div className="mt-1 text-white/50 opacity-0 transition-opacity group-hover:text-white group-hover:opacity-100">
                        <RiArrowRightUpLine className="text-xl" />
                      </div>
                    </div>

                    <p className="font-sans text-base leading-relaxed text-white/50">
                      {blog.excerpt}
                    </p>

                    <div className="flex items-center gap-4 pt-4 font-mono text-sm text-white/40">
                      <span>{blog.date}</span>
                    </div>
                  </article>
                </Link>
              </FadeUp>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
