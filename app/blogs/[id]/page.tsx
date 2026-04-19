import FadeUp from "@/components/FadeUp";
import { getBlogs, getNotionPageMarkdown } from "@/lib/integrations/notion";
import Link from "next/link";
import { RiArrowLeftLine } from "react-icons/ri";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function BlogIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const blogsData = await getBlogs();
  const blog = blogsData?.find((b) => b.id === id);

  if (!blog) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-[#000000] text-white">
        <h1 className="font-mono text-4xl font-bold">404</h1>
        <p className="text-white/50">Post not found.</p>
        <Link
          href="/blogs"
          className="mt-8 border-b border-white/20 pb-1 transition-colors hover:text-white/80"
        >
          Return to Blogs
        </Link>
      </main>
    );
  }

  const markdown = await getNotionPageMarkdown(id);

  return (
    <main className="min-h-screen bg-[#000000] px-6 py-24 text-white selection:bg-white/30 md:px-24">
      <div className="mx-auto max-w-3xl space-y-12">
        <FadeUp>
          <div className="flex flex-col gap-8">
            <Link
              href="/blogs"
              className="group flex w-fit items-center gap-2 font-mono text-sm uppercase tracking-widest text-white/50 transition-colors hover:text-white"
            >
              <RiArrowLeftLine className="transition-transform group-hover:-translate-x-1" />
              All Blogs
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{blog.title}</h1>
              <div className="flex items-center gap-4 font-mono text-sm text-white/40">
                <span>{blog.date}</span>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp>
          <article className="prose prose-invert prose-lg prose-p:text-white/70 prose-a:text-white hover:prose-a:text-white/80 prose-headings:font-sans max-w-none break-words font-sans">
            {markdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            ) : (
              <p>{blog.excerpt}</p>
            )}
          </article>
        </FadeUp>
      </div>
    </main>
  );
}
