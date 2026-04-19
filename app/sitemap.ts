import { getBlogs } from "@/lib/integrations/notion";
import { MetadataRoute } from "next";

const BASE_URL = "https://www.adithyakrishnan.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // Base routes
  const routes = [
    { url: "", priority: 1, changeFrequency: "monthly" as const },
    { url: "/blogs", priority: 0.8, changeFrequency: "weekly" as const },
  ];

  const sitemapRoutes = routes.map((route) => ({
    url: BASE_URL + route.url,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Blog dynamic routes
  try {
    const blogs = await getBlogs();
    if (blogs && blogs.length > 0) {
      const blogRoutes = blogs.map((blog) => ({
        url: `${BASE_URL}/blogs/${blog.id}`,
        lastModified: blog.date ? new Date(blog.date) : currentDate,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
      sitemapRoutes.push(...blogRoutes);
    }
  } catch (error) {
    console.error("Error generating blog sitemap:", error);
  }

  return sitemapRoutes;
}
