"use client";

import { CustomCursor } from "@/components/layout/CustomCursor";
import FadeUp from "@/components/ui/FadeUp";
import { BlogItemData } from "@/lib/integrations/notion";
import { useFollowPointer } from "@/hooks";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { useRef } from "react";
import { RiArrowRightUpLine } from "react-icons/ri";


export default function BlogsClient({ blogs }: { blogs: BlogItemData[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useFollowPointer(ref);

  return (
    <div className="flex h-full min-h-screen w-full flex-col justify-between text-white" ref={ref}>
      {/* Floating Navbar */}
      <Navbar />

      {/* Custom Follow Cursor */}
      <CustomCursor x={x} y={y} />

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-32 selection:bg-white selection:text-black sm:px-8 md:px-12 md:pt-48">
        {/* Header Section */}
        <div className="mb-12 space-y-6 md:mb-16">
          <FadeUp>
            <div className="flex items-baseline gap-4">
              <h1 className="font-mono text-sm uppercase tracking-[0.3em] text-neutral-500">
                Writing
              </h1>
              {blogs && blogs.length > 0 && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-700">
                  {String(blogs.length).padStart(2, "0")} entries
                </span>
              )}
            </div>
          </FadeUp>
          <FadeUp>
            <p className="max-w-3xl text-xl font-light leading-relaxed text-neutral-400 md:text-3xl">
              Deep thoughts, candid questions, and random explorations. Core ideas brain-dumped by
              me, structured and polished with AI.
            </p>
          </FadeUp>
        </div>

        {/* Blogs List */}
        {!blogs || blogs.length === 0 ? (
          <FadeUp>
            <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 py-20">
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                No articles published yet
              </p>
              <p className="text-xs text-neutral-600">Check back soon for new content</p>
            </div>
          </FadeUp>
        ) : (
          <div className="flex flex-col border-t border-white/10">
            {blogs.map((blog, index) => (
              <FadeUp key={blog.id}>
                <Link
                  href={`/blogs/${blog.id}`}
                  className="interactable group flex flex-col gap-2 border-b border-white/10 px-1 py-5 transition-colors duration-300 hover:bg-white/[0.02] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/40 md:flex-row md:items-center md:justify-between md:gap-8 md:py-6"
                >
                  <div className="flex min-w-0 items-baseline gap-4 md:flex-1">
                    <span className="shrink-0 font-mono text-xs text-neutral-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="space-grotesk truncate text-xl font-semibold tracking-tight text-white transition-colors duration-300 group-hover:text-neutral-300 md:text-2xl">
                      {blog.title}
                    </h2>
                  </div>

                  <p className="hidden max-w-sm truncate pl-8 text-sm font-light text-neutral-500 md:block md:pl-0">
                    {blog.excerpt}
                  </p>

                  <div className="flex shrink-0 items-center gap-4 pl-8 font-mono text-[11px] uppercase tracking-widest text-neutral-600 md:pl-0">
                    <span>{blog.date}</span>
                    <span aria-hidden className="text-neutral-700">/</span>
                    <span>{blog.readingTime} min</span>
                    <RiArrowRightUpLine className="h-4 w-4 text-neutral-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
