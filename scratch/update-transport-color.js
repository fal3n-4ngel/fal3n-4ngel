const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const TRANSPORT_PAGE_ID = "391e545c-4a67-8108-96ab-e0317b74e79c";

async function run() {
  try {
    // Set Transport to a vibrant chart blue color (#0070f3 or #0084ff)
    const color = "#0084ff";
    const emoji = "🚗";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="55%" font-size="120" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`;
    const coverUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    
    console.log(`Setting Transport color to ${color}...`);
    await notion.pages.update({
      page_id: TRANSPORT_PAGE_ID,
      cover: {
        type: "external",
        external: {
          url: coverUrl
        }
      }
    });
    console.log("✅ Transport cover color updated to blue!");
  } catch (error) {
    console.error("❌ Error:", error.message || error);
  }
}

run();
