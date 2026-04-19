"use server";

import { ExperienceItem } from "@/data/experience";
import { Project } from "@/types/projects";
import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const EXPERIENCES_DB_ID = process.env.NOTION_EXPERIENCE_DB_ID;
const PROJECTS_DB_ID = process.env.NOTION_PROJECTS_DB_ID;
const AWARDS_DB_ID = process.env.NOTION_AWARDS_DB_ID;

type ConfigAccumulator = Record<string, { isEnabled: boolean; content: string }>;

type NotionPropertyObject = {
  title?: Array<{ plain_text: string }>;
  rich_text?: Array<{ plain_text: string }>;
  url?: string | null;
  checkbox?: boolean;
  select?: { name: string };
  formula?: { string: string };
};

type NotionPage = {
  properties: Record<string, NotionPropertyObject>;
};

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

      return response.results.reduce((acc: ConfigAccumulator, page: unknown) => {
        const p = page as NotionPage;
        const name = p.properties.Name?.title?.[0]?.plain_text;

        const isEnabled = p.properties.Status?.checkbox ?? false;

        const content =
          p.properties.Text?.rich_text?.[0]?.plain_text ||
          p.properties.LinkText?.url ||
          p.properties.LinkText?.rich_text?.[0]?.plain_text ||
          p.properties.LinkText?.formula?.string ||
          "";

        if (name) {
          acc[name.toLowerCase()] = { isEnabled, content };
        }
        return acc;
      }, {} as ConfigAccumulator);
    } catch (error) {
      console.error("❌ Notion Fetch Error:", error);
      return null;
    }
  },
  ["site-config"],
  { revalidate: 60, tags: ["config"] }
);

export const getExperiences = unstable_cache(
  async (): Promise<ExperienceItem[]> => {
    try {
      if (!EXPERIENCES_DB_ID) return [];

      const response = await notion.databases.query({
        database_id: EXPERIENCES_DB_ID,
        sorts: [
          {
            property: "Order",
            direction: "ascending",
          },
        ],
      });

      return response.results.map((page: unknown) => {
        const p = page as NotionPage;
        return {
          title: p.properties.Title?.title?.[0]?.plain_text || "",
          company: p.properties.Company?.rich_text?.[0]?.plain_text || "",
          companyUrl: p.properties["Company URL"]?.url || "",
          period: p.properties.Period?.rich_text?.[0]?.plain_text || "",
        };
      });
    } catch (error) {
      console.error("❌ Notion Fetch Error:", error);
      return [];
    }
  },
  ["experiences"],
  { revalidate: 60, tags: ["experiences"] }
);

export const getProjects = unstable_cache(
  async (): Promise<Project[]> => {
    try {
      if (!PROJECTS_DB_ID) return [];

      const response = await notion.databases.query({
        database_id: PROJECTS_DB_ID,
        sorts: [
          {
            property: "Order",
            direction: "ascending",
          },
        ],
      });

      return response.results.map((page: unknown) => {
        const p = page as NotionPage;
        return {
          url1: p.properties["Image URL"]?.url || "",
          name: p.properties.Name?.title?.[0]?.plain_text || "",
          type: p.properties.Type?.select?.name || "",
          event: p.properties.Event?.select?.name || "",
          date: p.properties.Date?.rich_text?.[0]?.plain_text || "",
          view: p.properties.URL?.url || "",
          description: p.properties.Description?.rich_text?.[0]?.plain_text || "",
        };
      });
    } catch (error) {
      console.error("❌ Notion Fetch Error:", error);
      return [];
    }
  },
  ["projects"],
  { revalidate: 60, tags: ["projects"] }
);

export interface AwardItemData {
  title: string;
  org: string;
  team: string;
  date: string;
}

export const getAwards = unstable_cache(
  async (): Promise<AwardItemData[]> => {
    try {
      if (!AWARDS_DB_ID) return [];

      const response = await notion.databases.query({
        database_id: AWARDS_DB_ID,
        sorts: [
          {
            property: "Order",
            direction: "ascending",
          },
        ],
      });

      return response.results.map((page: unknown) => {
        const p = page as NotionPage;
        return {
          title: p.properties.Title?.title?.[0]?.plain_text || "",
          org: p.properties.Organization?.rich_text?.[0]?.plain_text || "",
          team: p.properties.Team?.rich_text?.[0]?.plain_text || "",
          date: p.properties.Date?.rich_text?.[0]?.plain_text || "",
        };
      });
    } catch (error) {
      console.error("❌ Notion Fetch Error:", error);
      return [];
    }
  },
  ["awards"],
  { revalidate: 60, tags: ["awards"] }
);
