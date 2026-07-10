const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CATEGORIES_DB_ID = "f21a1feb-b4f5-4504-94b8-7a1b1dfe10ba";

const BUDGETS = {
  "Food": 6000,
  "Drinks": 2000,
  "Transport": 3000,
  "Groceries": 5000,
  "Shopping": 6000,
  "Health & Fitness": 3000,
  "Utilities": 10000,
  "Entertainment": 5000,
  "Home": 5000
};

async function run() {
  try {
    console.log("🛠️ Adding Limit and Progress properties to Categories database...");
    
    await notion.databases.update({
      database_id: CATEGORIES_DB_ID,
      properties: {
        "Limit": {
          number: {
            format: "rupee"
          }
        },
        "Progress": {
          formula: {
            expression: 'if(empty(prop("Limit")) or prop("Limit") == 0, 0, prop("Total") / prop("Limit"))'
          }
        }
      }
    });
    console.log("✅ Database schema updated successfully!");

    console.log("📈 Fetching category pages to apply budget limits...");
    const response = await notion.databases.query({
      database_id: CATEGORIES_DB_ID
    });

    for (const page of response.results) {
      const name = page.properties.Name?.title?.[0]?.plain_text || "";
      const limit = BUDGETS[name] || 5000; // default 5000 limit

      console.log(`Setting limit of ₹${limit.toLocaleString("en-IN")} for category: ${name}`);
      await notion.pages.update({
        page_id: page.id,
        properties: {
          "Limit": {
            number: limit
          }
        }
      });
    }

    console.log("🎉 Progress bars and limits applied successfully!");
  } catch (error) {
    console.error("❌ Error applying progress bars:", error.message || error);
  }
}

run();
