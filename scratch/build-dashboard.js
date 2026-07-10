const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const PAGE_ID = "391e545c-4a67-81ba-a59c-c01fddd5123b";
const EXPENSES_DB_ID = "391e545c-4a67-81b8-90cc-d43c482d991e";
const CATEGORIES_DB_ID = "f21a1feb-b4f5-4504-94b8-7a1b1dfe10ba";
const BUDGET = 25000;

async function run() {
  try {
    console.log("🔄 Fetching current cycle expenses...");
    const response = await notion.databases.query({
      database_id: EXPENSES_DB_ID,
      filter: {
        property: "Current Cycle",
        formula: {
          checkbox: {
            equals: true
          }
        }
      }
    });

    const total = response.results.reduce((sum, page) => {
      return sum + (page.properties.Amount?.number || 0);
    }, 0);

    const remaining = BUDGET - total;
    console.log(`💰 Total Spent: ₹${total.toLocaleString("en-IN")}`);
    console.log(`🎯 Remaining: ₹${remaining.toLocaleString("en-IN")}`);

    console.log("🧹 Listing existing blocks to delete...");
    const existingBlocks = await notion.blocks.children.list({ block_id: PAGE_ID });
    for (const block of existingBlocks.results) {
      console.log(`Deleting block: ${block.id} (${block.type})`);
      await notion.blocks.delete({ block_id: block.id });
    }

    console.log("🏗️ Constructing dashboard blocks...");
    const blocks = [
      // 1. Welcome Callout
      {
        object: "block",
        type: "callout",
        callout: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "Personal Expense Dashboard\n",
                link: null
              },
              annotations: { bold: true }
            },
            {
              type: "text",
              text: {
                content: "Welcome to your automated expense tracker. Use your custom ChatGPT assistant to log new expenses naturally, view totals, and analyze your spending.",
                link: null
              }
            }
          ],
          icon: { type: "emoji", emoji: "💸" },
          color: "gray_background"
        }
      },
      // 2. Space Divider
      { object: "block", type: "divider", divider: {} },
      // 3. Stats Row Columns (Column List)
      {
        object: "block",
        type: "column_list",
        column_list: {
          children: [
            // Column 1: Current Spend
            {
              object: "block",
              type: "column",
              column: {
                children: [
                  {
                    object: "block",
                    type: "callout",
                    callout: {
                      rich_text: [
                        {
                          type: "text",
                          text: { content: "Current Cycle Spend\n", link: null },
                          annotations: { bold: true, color: "gray" }
                        },
                        {
                          type: "text",
                          text: { content: `₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n`, link: null },
                          annotations: { bold: true }
                        },
                        {
                          type: "text",
                          text: { content: "Billing Period: 25th - 24th", link: null },
                          annotations: { italic: true, color: "gray" }
                        }
                      ],
                      icon: { type: "emoji", emoji: "💳" },
                      color: "green_background"
                    }
                  }
                ]
              }
            },
            // Column 2: Budget Progress
            {
              object: "block",
              type: "column",
              column: {
                children: [
                  {
                    object: "block",
                    type: "callout",
                    callout: {
                      rich_text: [
                        {
                          type: "text",
                          text: { content: "Monthly Budget Status\n", link: null },
                          annotations: { bold: true, color: "gray" }
                        },
                        {
                          type: "text",
                          text: { content: `₹${remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n`, link: null },
                          annotations: { bold: true }
                        },
                        {
                          type: "text",
                          text: { content: remaining >= 0 ? "Under budget" : "Over budget!", link: null },
                          annotations: { italic: true, color: remaining >= 0 ? "gray" : "red" }
                        }
                      ],
                      icon: { type: "emoji", emoji: "🎯" },
                      color: remaining >= 0 ? "blue_background" : "red_background"
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      // 4. Space Divider
      { object: "block", type: "divider", divider: {} },
      // 5. Category Header
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "📂 Categories & Summaries" } }]
        }
      },
      // 6. Linked Database for Categories
      {
        object: "block",
        type: "link_to_page",
        link_to_page: {
          type: "database_id",
          database_id: CATEGORIES_DB_ID
        }
      },
      // 7. Transactions Header
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "📝 Recent Logged Expenses" } }]
        }
      },
      // 8. Linked Database for Expenses Tracker
      {
        object: "block",
        type: "link_to_page",
        link_to_page: {
          type: "database_id",
          database_id: EXPENSES_DB_ID
        }
      },
      // 9. Quick tip Callout
      {
        object: "block",
        type: "callout",
        callout: {
          rich_text: [
            {
              type: "text",
              text: { content: "💡 Quick Tip: ", link: null },
              annotations: { bold: true }
            },
            {
              type: "text",
              text: { content: "Log your daily expenses via your custom ChatGPT assistant. Try saying: ", link: null }
            },
            {
              type: "text",
              text: { content: '"Spent ₹250 on tea just now"', link: null },
              annotations: { italic: true, bold: true }
            },
            {
              type: "text",
              text: { content: ". It will instantly add it to Notion and update the totals here.", link: null }
            }
          ],
          icon: { type: "emoji", emoji: "💡" },
          color: "gray_background"
        }
      }
    ];

    console.log("🚀 Appending dashboard blocks to page...");
    await notion.blocks.children.append({
      block_id: PAGE_ID,
      children: blocks
    });

    console.log("✅ Dashboard created successfully!");
  } catch (error) {
    console.error("❌ Error building dashboard:", error);
  }
}

run();
