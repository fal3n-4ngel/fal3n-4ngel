import { getBlogs, getNotionPageMarkdown } from "@/lib/integrations/notion";
import { Metadata } from "next";
import { notFound } from "next/navigation";
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
      robots: { index: false, follow: false },
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

export default async function BlogIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const blogsData = await getBlogs();
  const blog = blogsData?.find((b) => b.id === id);

  if (!blog) {
    notFound();
  }

  const markdown = await getNotionPageMarkdown(id);

  return <BlogIdClient blog={blog} markdown={markdown || ""} />;
}
