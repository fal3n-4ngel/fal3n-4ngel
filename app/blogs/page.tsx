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
    <main className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-black px-6 text-white">
      <BlogsClient blogs={blogs} />;
    </main>
  );
}
