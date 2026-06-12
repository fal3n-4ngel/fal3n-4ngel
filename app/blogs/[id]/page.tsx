import { getBlogs, getNotionPageMarkdown } from "@/lib/integrations/notion";
import { Metadata } from "next";
import Link from "next/link";
import { RiArrowLeftLine } from "react-icons/ri";
import BlogIdClient from "./BlogIdClient";

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
    <BlogIdClient
      blog={blog}
      markdown={markdown || ""}
      readingTime={readingTime}
    />
  );
}
