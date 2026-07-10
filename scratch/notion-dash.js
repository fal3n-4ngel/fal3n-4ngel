const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const PAGE_ID = "391e545c-4a67-81ba-a59c-c01fddd5123b";

async function run() {
  try {
    const blocks = await notion.blocks.children.list({ block_id: PAGE_ID });
    console.log("Blocks on page:");
    blocks.results.forEach(b => {
      console.log(`- ID: ${b.id}, Type: ${b.type}, Details:`, JSON.stringify(b[b.type]));
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
