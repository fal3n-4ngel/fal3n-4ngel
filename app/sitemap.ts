import { MetadataRoute } from "next";

const BASE_URL = "https://www.adithyakrishnan.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  const routes = [{ url: "", priority: 1, changeFrequency: "monthly" as const }];

  return routes.map((route) => ({
    url: BASE_URL + route.url,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
