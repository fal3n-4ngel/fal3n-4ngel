import { getBlogs } from "@/lib/integrations/notion";
import BlogsClient from "./BlogsClient";

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

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <main className="min-h-screen bg-black text-white">
      <BlogsClient blogs={blogs} />
    </main>
  );
}
