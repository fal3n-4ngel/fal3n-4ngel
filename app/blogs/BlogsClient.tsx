"use client";

import { CustomCursor } from "@/components/CustomCursor";
import FadeUp from "@/components/FadeUp";
import { BlogItemData } from "@/lib/integrations/notion";
import { useFollowPointer } from "@/lib/utils/FollowPointer";
import { Navbar } from "@/sections/Navbar";
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

      <main className="mx-auto max-w-6xl px-12 pb-24 pt-48 selection:bg-white selection:text-black">
        {/* Header Section */}
        <div className="mb-24 space-y-6">
          <FadeUp>
            <h1 className="font-mono text-sm uppercase tracking-[0.3em] text-neutral-500">
              Writing
            </h1>
          </FadeUp>
          <FadeUp>
            <p className="max-w-3xl text-xl font-light leading-relaxed text-neutral-400 md:text-3xl">
              Deep thoughts, candid questions, and random explorations. Core ideas brain-dumped by
              me, structured and polished with AI.
            </p>
          </FadeUp>
        </div>

        {/* Blogs List */}
        <div className="flex flex-col border-b border-white/10">
          {!blogs || blogs.length === 0 ? (
            <FadeUp>
              <div className="flex flex-col items-center justify-center gap-3 border-t border-white/10 py-20">
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                  No articles published yet
                </p>
                <p className="text-xs text-neutral-600">Check back soon for new content</p>
              </div>
            </FadeUp>
          ) : (
            blogs.map((blog) => {
              // Calculate reading time based on word count of excerpt
              const wordsPerMinute = 200;
              const wordCount = (blog.excerpt || "").split(/\s+/).length;
              const readingTime = Math.ceil(wordCount / wordsPerMinute) || 2;

              return (
                <FadeUp key={blog.id}>
                  <div className="group flex flex-col gap-6 border-t border-white/10 py-12 transition-colors duration-300 hover:border-white/20 md:flex-row md:items-start md:gap-12">
                    {/* Left Meta Column */}
                    <div className="w-full shrink-0 md:w-1/4">
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                        {blog.date}
                      </div>
                      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-600">
                        {readingTime} min read
                      </div>
                    </div>

                    {/* Right Content Column */}
                    <div className="flex-1 space-y-4">
                      <h2 className="text-2xl font-light leading-tight text-white transition-colors group-hover:text-neutral-300 md:text-3xl">
                        <Link
                          href={`/blogs/${blog.id}`}
                          className="interactable flex items-start justify-between gap-4"
                        >
                          <span className="leading-tight">{blog.title}</span>
                          <span className="mt-1.5 shrink-0 rounded-full bg-neutral-800 p-2 text-white transition-all group-hover:bg-white group-hover:text-black">
                            <RiArrowRightUpLine className="h-4 w-4 md:h-5 md:w-5" />
                          </span>
                        </Link>
                      </h2>
                      <p className="max-w-3xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
