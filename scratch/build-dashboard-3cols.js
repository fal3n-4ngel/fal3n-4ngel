const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const PAGE_ID = "391e545c-4a67-81ba-a59c-c01fddd5123b";
const EXPENSES_DB_ID = "391e545c-4a67-81b8-90cc-d43c482d991e";
const CATEGORIES_DB_ID = "f21a1feb-b4f5-4504-94b8-7a1b1dfe10ba";
const BUDGET = 25000;

async function run() {
  try {
    // 1. Calculate Billing Cycle Dates
    const today = new Date();
    let currentCycleStart, currentCycleEnd, prevCycleStart, prevCycleEnd;

    const day = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed

    if (day >= 25) {
      currentCycleStart = new Date(year, month, 25);
      currentCycleEnd = new Date(year, month + 1, 24);
      prevCycleStart = new Date(year, month - 1, 25);
      prevCycleEnd = new Date(year, month, 24);
    } else {
      currentCycleStart = new Date(year, month - 1, 25);
      currentCycleEnd = new Date(year, month, 24);
      prevCycleStart = new Date(year, month - 2, 25);
      prevCycleEnd = new Date(year, month - 1, 24);
    }

    const formatDateStr = (d) => d.toISOString().slice(0, 10);
    const curStartStr = formatDateStr(currentCycleStart);
    const curEndStr = formatDateStr(currentCycleEnd);
    const prevStartStr = formatDateStr(prevCycleStart);
    const prevEndStr = formatDateStr(prevCycleEnd);

    console.log(`Current Cycle: ${curStartStr} to ${curEndStr}`);
    console.log(`Previous Cycle: ${prevStartStr} to ${prevEndStr}`);

    // 2. Query Current Cycle Expenses
    console.log("🔄 Fetching current cycle expenses...");
    const curResponse = await notion.databases.query({
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
    const curTotal = curResponse.results.reduce((sum, page) => {
      return sum + (page.properties.Amount?.number || 0);
    }, 0);

    // 3. Query Previous Cycle Expenses
    console.log("🔄 Fetching previous cycle expenses...");
    const prevResponse = await notion.databases.query({
      database_id: EXPENSES_DB_ID,
      filter: {
        and: [
          {
            property: "Date",
            date: {
              on_or_after: prevStartStr
            }
          },
          {
            property: "Date",
            date: {
              on_or_before: prevEndStr
            }
          }
        ]
      }
    });
    const prevTotal = prevResponse.results.reduce((sum, page) => {
      return sum + (page.properties.Amount?.number || 0);
    }, 0);

    const remaining = BUDGET - curTotal;
    console.log(`💰 Current Cycle Spend: ₹${curTotal}`);
    console.log(`💰 Previous Cycle Spend: ₹${prevTotal}`);

    console.log("🧹 Listing existing blocks to delete non-database blocks...");
    const existingBlocks = await notion.blocks.children.list({ block_id: PAGE_ID });
    
    // We only delete blocks of type callout, column_list, divider, heading_2
    // We do NOT delete the child_database blocks!
    for (const block of existingBlocks.results) {
      if (block.type !== "child_database") {
        console.log(`Deleting block: ${block.id} (${block.type})`);
        await notion.blocks.delete({ block_id: block.id });
      }
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
      // 2. Divider
      { object: "block", type: "divider", divider: {} },
      // 3. Stats Row Columns (Column List with 3 Columns)
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
                          text: { content: `₹${curTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n`, link: null },
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
            // Column 2: Previous Spend
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
                          text: { content: "Previous Cycle Spend\n", link: null },
                          annotations: { bold: true, color: "gray" }
                        },
                        {
                          type: "text",
                          text: { content: `₹${prevTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n`, link: null },
                          annotations: { bold: true }
                        },
                        {
                          type: "text",
                          text: { content: `Period: ${prevStartStr.slice(5)} to ${prevEndStr.slice(5)}`, link: null },
                          annotations: { italic: true, color: "gray" }
                        }
                      ],
                      icon: { type: "emoji", emoji: "⏮️" },
                      color: "gray_background"
                    }
                  }
                ]
              }
            },
            // Column 3: Budget Progress
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
      // 4. Divider
      { object: "block", type: "divider", divider: {} },
      // 5. Category Header
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "📂 Categories & Summaries" } }]
        }
      },
      // 6. Space or instruction placeholder (since Categories DB is inline at the bottom)
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: "👇 Drag your Categories database block directly under this heading." } }]
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
      // 8. Space or instruction placeholder (since Expenses DB is inline at the bottom)
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: "👇 Drag your Expenses Tracker database block directly under this heading." } }]
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

    console.log("🚀 Appending new 3-column dashboard blocks...");
    await notion.blocks.children.append({
      block_id: PAGE_ID,
      children: blocks
    });

    console.log("✅ 3-Column Dashboard created successfully!");
  } catch (error) {
    console.error("❌ Error building 3-column dashboard:", error.message || error);
  }
}

run();
