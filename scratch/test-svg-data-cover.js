const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const TRANSPORT_PAGE_ID = "391e545c-4a67-8108-96ab-e0317b74e79c";

async function run() {
  try {
    // Correctly formatted SVG data URL
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%2354a0ff"/><text x="50%" y="55%" font-size="120" text-anchor="middle" dominant-baseline="middle">🚗</text></svg>`;
    const coverUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    
    console.log("Setting SVG cover...");
    await notion.pages.update({
      page_id: TRANSPORT_PAGE_ID,
      cover: {
        type: "external",
        external: {
          url: coverUrl
        }
      }
    });
    console.log("✅ SVG Cover set!");
  } catch (error) {
    console.error("❌ Error setting SVG cover:", error);
  }
}

run();
