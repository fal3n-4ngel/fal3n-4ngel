"use server";

import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";

// Use private variables only for security
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
        // Extracting name property
        const name = page.properties.Name?.title[0]?.plain_text;

        // Handling checkboxes
        const isEnabled = page.properties.Status?.checkbox ?? false;

        // Content extraction logic
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
  ["site-config"], // Cache key
  { revalidate: 60, tags: ["config"] } // Revalidate every 60 seconds
);
