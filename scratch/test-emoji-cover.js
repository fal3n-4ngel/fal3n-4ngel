const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const TRANSPORT_PAGE_ID = "391e545c-4a67-8108-96ab-e0317b74e79c";

async function run() {
  try {
    // URL-encode the emoji for the query param
    const emoji = encodeURIComponent("🚗");
    const coverUrl = `https://placehold.co/600x400/54a0ff/ffffff/png?text=${emoji}`;
    
    console.log(`Setting cover URL: ${coverUrl}`);
    await notion.pages.update({
      page_id: TRANSPORT_PAGE_ID,
      cover: {
        type: "external",
        external: {
          url: coverUrl
        }
      }
    });
    console.log("✅ Transport cover updated!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

run();
