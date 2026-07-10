const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CATEGORIES_DB_ID = "f21a1feb-b4f5-4504-94b8-7a1b1dfe10ba";

// Mapping of Category names to matching colors and emojis
const CATEGORY_STYLES = {
  "Food & Drinks": {
    color: "ff9f43", // Warm Orange
    emoji: "🍔"
  },
  "Transport": {
    color: "54a0ff", // Sky Blue
    emoji: "🚗"
  },
  "Groceries": {
    color: "10ac84", // Emerald Green
    emoji: "🛒"
  },
  "Shopping": {
    color: "ff9ff3", // Pink
    emoji: "🛍️"
  },
  "Health & Fitness": {
    color: "2ee59d", // Light Mint Green
    emoji: "💊"
  },
  "Utilities": {
    color: "8395a7", // Slate Gray
    emoji: "🔌"
  },
  "Entertainment": {
    color: "5f27cd", // Deep Purple
    emoji: "🍿"
  },
  "Home": {
    color: "ffeaa7", // Soft Yellow/Gold
    emoji: "🏠"
  }
};

async function run() {
  try {
    console.log("📈 Fetching category pages to apply custom cover colors and icons...");
    const response = await notion.databases.query({
      database_id: CATEGORIES_DB_ID
    });

    for (const page of response.results) {
      const name = page.properties.Name?.title?.[0]?.plain_text || "";
      const style = CATEGORY_STYLES[name];

      if (style) {
        const coverUrl = `https://singlecolorimage.com/get/${style.color}/600x400`;
        console.log(`Setting style for '${name}': Icon '${style.emoji}', Color #${style.color}`);
        
        await notion.pages.update({
          page_id: page.id,
          cover: {
            type: "external",
            external: {
              url: coverUrl
            }
          },
          icon: {
            type: "emoji",
            emoji: style.emoji
          }
        });
      } else {
        console.log(`No style defined for category: '${name}'`);
      }
    }

    console.log("🎉 All category pages updated with premium cover colors and emojis!");
  } catch (error) {
    console.error("❌ Error setting covers:", error.message || error);
  }
}

run();
