"use client";

import { BlogItemData } from "@/lib/integrations/notion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { useFollowPointer } from "@/hooks";
import FadeUp from "@/components/ui/FadeUp";
import Link from "next/link";
import { useRef } from "react";
import { RiArrowLeftLine, RiCalendarLine } from "react-icons/ri";
import { motion, useScroll, useSpring } from "framer-motion";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogIdClient({
  blog,
  markdown,
  readingTime,
}: {
  blog: BlogItemData;
  markdown: string;
  readingTime: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useFollowPointer(ref);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div className="h-full min-h-screen w-full text-white" ref={ref}>
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-white/60"
        style={{ scaleX: progress }}
        aria-hidden
      />

      {/* Floating Navbar */}
      <Navbar />

      {/* Custom Follow Cursor */}
      <CustomCursor x={x} y={y} />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 selection:bg-white selection:text-black sm:px-8 md:px-12 md:pt-48">
        {/* Breadcrumb Navigation */}
        <FadeUp>
          <Link
            href="/blogs"
            className="interactable group inline-flex items-center gap-2 rounded-sm font-mono text-xs uppercase tracking-widest text-neutral-500 transition-all hover:gap-3 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/40"
          >
            <RiArrowLeftLine className="transition-transform group-hover:-translate-x-1" />
            All Blogs
          </Link>
        </FadeUp>

        {/* Article Header */}
        <FadeUp>
          <div className="mt-12 space-y-6 border-b border-white/10 pb-8">
            <h1 className="space-grotesk text-balance text-3xl font-light leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <RiCalendarLine className="text-neutral-600" />
                <span>{blog.date}</span>
              </div>
              <span className="text-neutral-700">•</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </FadeUp>

        {/* Article Content */}
        <FadeUp>
          <article className="prose prose-invert max-w-none space-y-6 break-words pt-12 prose-headings:font-light prose-headings:tracking-tight prose-h1:mb-4 prose-h1:mt-12 prose-h1:text-3xl prose-h1:text-white prose-h2:mb-4 prose-h2:mt-12 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-4 prose-h2:text-2xl prose-h2:text-white prose-h3:mb-3 prose-h3:mt-8 prose-h3:text-xl prose-h3:text-white/90 prose-h4:mb-2 prose-h4:mt-6 prose-h4:text-lg prose-h4:text-white/80 prose-p:my-6 prose-p:text-base prose-p:leading-relaxed prose-p:text-neutral-300 prose-a:text-white prose-a:underline prose-a:decoration-white/30 prose-a:underline-offset-4 prose-a:transition-all hover:prose-a:text-white/80 hover:prose-a:decoration-white/50 prose-blockquote:my-8 prose-blockquote:border-l-4 prose-blockquote:border-white/20 prose-blockquote:bg-white/[0.02] prose-blockquote:py-2 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-neutral-400 prose-blockquote:prose-p:my-0 prose-strong:font-semibold prose-strong:text-white prose-em:italic prose-em:text-neutral-300 prose-code:rounded prose-code:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:text-white prose-code:before:content-none prose-code:after:content-none prose-pre:my-8 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-white/10 prose-pre:bg-white/[0.04] prose-pre:p-4 prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-pre:prose-code:text-white/80 prose-ol:my-6 prose-ol:space-y-3 prose-ol:pl-6 prose-ol:text-neutral-300 prose-ul:my-6 prose-ul:space-y-3 prose-ul:pl-6 prose-ul:text-neutral-300 prose-li:my-1 prose-li:text-neutral-300 prose-li:marker:text-neutral-500 prose-table:my-8 prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-white/10 prose-table:text-sm prose-th:border prose-th:border-white/10 prose-th:bg-white/[0.03] prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-white/85 prose-td:border prose-td:border-white/10 prose-td:px-4 prose-td:py-3 prose-td:text-neutral-400 prose-img:my-8 prose-img:rounded-lg prose-img:border prose-img:border-white/10 prose-hr:my-12 prose-hr:border-white/10 prose-h1:md:text-4xl prose-h2:md:text-3xl prose-h3:md:text-2xl prose-p:md:text-lg">
            {markdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            ) : (
              <p>{blog.excerpt}</p>
            )}
          </article>
        </FadeUp>

        {/* Back Link Footer */}
        <FadeUp>
          <div className="mt-16 border-t border-white/10 pt-8">
            <Link
              href="/blogs"
              className="interactable group inline-flex items-center gap-2 rounded-sm font-mono text-xs uppercase tracking-widest text-neutral-500 transition-all hover:gap-3 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/40"
            >
              <RiArrowLeftLine className="transition-transform group-hover:-translate-x-1" />
              Back to Blogs
            </Link>
          </div>
        </FadeUp>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
