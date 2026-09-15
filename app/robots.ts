import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/llms.txt"],
      disallow: ["/private/", "/api/"],
    },
    sitemap: "https://www.adithyakrishnan.com/sitemap.xml",
  };
}
