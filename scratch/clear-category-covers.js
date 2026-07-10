const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CATEGORIES_DB_ID = "f21a1feb-b4f5-4504-94b8-7a1b1dfe10ba";

async function run() {
  try {
    console.log("🧹 Clearing cover images from Categories database to remove the '?' placeholders...");
    const response = await notion.databases.query({
      database_id: CATEGORIES_DB_ID
    });

    for (const page of response.results) {
      const name = page.properties.Name?.title?.[0]?.plain_text || "";
      console.log(`Clearing cover for: ${name}`);
      
      await notion.pages.update({
        page_id: page.id,
        cover: null
      });
    }

    console.log("🎉 All category page covers cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing covers:", error.message || error);
  }
}

run();
