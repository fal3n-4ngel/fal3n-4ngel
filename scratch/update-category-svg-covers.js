const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CATEGORIES_DB_ID = "f21a1feb-b4f5-4504-94b8-7a1b1dfe10ba";

// Mapping of Category names to matching colors and emojis
const CATEGORY_STYLES = {
  "Food & Drinks": {
    color: "#ff9f43", // Warm Orange
    emoji: "🍔"
  },
  "Transport": {
    color: "#111111", // Sleek Black
    emoji: "🚗"
  },
  "Groceries": {
    color: "#10ac84", // Emerald Green
    emoji: "🛒"
  },
  "Shopping": {
    color: "#ff9ff3", // Pink
    emoji: "🛍️"
  },
  "Health & Fitness": {
    color: "#2ee59d", // Light Mint Green
    emoji: "💊"
  },
  "Utilities": {
    color: "#8395a7", // Slate Gray
    emoji: "🔌"
  },
  "Entertainment": {
    color: "#5f27cd", // Deep Purple
    emoji: "🍿"
  },
  "Home": {
    color: "#ffeaa7", // Soft Yellow/Gold
    emoji: "🏠"
  }
};

async function run() {
  try {
    console.log("📈 Updating Category card covers with correctly encoded SVG colors...");
    const response = await notion.databases.query({
      database_id: CATEGORIES_DB_ID
    });

    for (const page of response.results) {
      const name = page.properties.Name?.title?.[0]?.plain_text || "";
      const style = CATEGORY_STYLES[name];

      if (style) {
        // Generate SVG containing the centered emoji and colored background
        // Use standard '#' symbol for fill; encodeURIComponent will handle the encoding once.
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="${style.color}"/><text x="50%" y="55%" font-size="120" text-anchor="middle" dominant-baseline="middle">${style.emoji}</text></svg>`;
        const coverUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        
        console.log(`Updating '${name}': Emoji '${style.emoji}', Color ${style.color}`);
        
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

    console.log("🎉 All category covers updated successfully with their correct colors!");
  } catch (error) {
    console.error("❌ Error setting covers:", error.message || error);
  }
}

run();
