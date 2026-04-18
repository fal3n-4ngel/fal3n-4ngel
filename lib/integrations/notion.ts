"use server";

import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export const getSiteConfig = unstable_cache(
  async () => {
    try {
      if (!DATABASE_ID) {
        console.warn("⚠️ Notion Database ID is missing.");
        return null;
      }

      const response = await notion.databases.query({
        database_id: DATABASE_ID,
      });

      return response.results.reduce((acc: any, page: any) => {
        const name = page.properties.Name?.title[0]?.plain_text;

        const isEnabled = page.properties.Status?.checkbox ?? false;

        const content =
          page.properties.Text?.rich_text?.[0]?.plain_text ||
          page.properties.LinkText?.url ||
          page.properties.LinkText?.rich_text?.[0]?.plain_text ||
          page.properties.LinkText?.formula?.string ||
          "";

        if (name) {
          acc[name.toLowerCase()] = { isEnabled, content };
        }
        return acc;
      }, {});
    } catch (error) {
      console.error("❌ Notion Fetch Error:", error);
      return null;
    }
  },
  ["site-config"],
  { revalidate: 60, tags: ["config"] }
);
