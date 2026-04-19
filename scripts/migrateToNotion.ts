import { config } from "dotenv";
config({ path: ".env.local" });

import { Client } from "@notionhq/client";
import { EXPERIENCE_DATA } from "../data/experience";
import { projects } from "../data/projects";

// Ensure you have these environment variables set
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const PARENT_PAGE_ID = "347e545c4a678028bd23e13ad5379a1a";

async function createExperienceDatabase(parentId: string) {
  console.log("Creating Experience Database...");
  const db = await notion.databases.create({
    parent: {
      type: "page_id",
      page_id: parentId,
    },
    icon: {
      type: "emoji",
      emoji: "💼",
    },
    title: [
      {
        type: "text",
        text: {
          content: "Experience",
        },
      },
    ],
    properties: {
      Title: {
        title: {},
      },
      Company: {
        rich_text: {},
      },
      "Company URL": {
        url: {},
      },
      Period: {
        rich_text: {},
      },
      Order: {
        number: { format: "number" },
      },
    },
  });

  console.log("Populating Experience Database...");
  for (let index = 0; index < EXPERIENCE_DATA.length; index++) {
    const exp = EXPERIENCE_DATA[index]!;
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Order: {
          number: index + 1,
        },
        Title: {
          title: [
            {
              text: { content: exp.title },
            },
          ],
        },
        Company: {
          rich_text: [
            {
              text: { content: exp.company },
            },
          ],
        },
        "Company URL": {
          url: exp.companyUrl || null,
        },
        Period: {
          rich_text: [
            {
              text: { content: exp.period },
            },
          ],
        },
      },
    });
  }
  console.log(`✅ Experience Database created! ID: ${db.id}`);
  return db.id;
}

async function createProjectsDatabase(parentId: string) {
  console.log("Creating Projects Database...");
  const db = await notion.databases.create({
    parent: {
      type: "page_id",
      page_id: parentId,
    },
    icon: {
      type: "emoji",
      emoji: "🚀",
    },
    title: [
      {
        type: "text",
        text: {
          content: "Projects",
        },
      },
    ],
    properties: {
      Name: {
        title: {},
      },
      "Image URL": {
        url: {},
      },
      Type: {
        select: {
          options: [
            { name: "Desktop App", color: "blue" },
            { name: "Website", color: "green" },
            { name: "Mobile App", color: "purple" },
            { name: "Java | Swing App", color: "red" },
          ],
        },
      },
      Event: {
        select: {
          options: [
            { name: "College Project", color: "yellow" },
            { name: "Side Project", color: "gray" },
            { name: "Hackathon", color: "orange" },
            { name: "BlockHash", color: "brown" },
          ],
        },
      },
      Date: {
        rich_text: {},
      },
      URL: {
        url: {},
      },
      Description: {
        rich_text: {},
      },
      Order: {
        number: { format: "number" },
      },
    },
  });

  console.log("Populating Projects Database...");
  for (let index = 0; index < projects.length; index++) {
    const proj = projects[index]!;
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Order: {
          number: index + 1,
        },
        Name: {
          title: [
            {
              text: { content: proj.name },
            },
          ],
        },
        "Image URL": {
          url: proj.url1 || null,
        },
        Type: {
          select: { name: proj.type },
        },
        Event: {
          select: { name: proj.event },
        },
        Date: {
          rich_text: [
            {
              text: { content: proj.date },
            },
          ],
        },
        URL: {
          url: proj.view || null,
        },
        Description: {
          rich_text: [
            {
              text: { content: proj.description },
            },
          ],
        },
      },
    });
  }
  console.log(`✅ Projects Database created! ID: ${db.id}`);
  return db.id;
}

async function createAwardsDatabase(parentId: string) {
  console.log("Creating Awards Database...");
  const db = await notion.databases.create({
    parent: {
      type: "page_id",
      page_id: parentId,
    },
    icon: {
      type: "emoji",
      emoji: "🏆",
    },
    title: [
      {
        type: "text",
        text: {
          content: "Awards",
        },
      },
    ],
    properties: {
      Title: {
        title: {},
      },
      Organization: {
        rich_text: {},
      },
      Team: {
        rich_text: {},
      },
      Date: {
        rich_text: {},
      },
      Order: {
        number: { format: "number" },
      },
    },
  });

  const awardsData = [
    {
      title: "Web3 for India Winner",
      org: "BlockHash | Kerala Blockchain Academy",
      team: "Team deflated pappadam",
      date: "2023",
    },
    {
      title: "Best Design, 1st Runner Up",
      org: "CodeCrypt Hackathon | Cusat",
      team: "Team deflated pappadam",
      date: "2023",
    },
  ];

  console.log("Populating Awards Database...");
  for (let index = 0; index < awardsData.length; index++) {
    const award = awardsData[index]!;
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Order: {
          number: index + 1,
        },
        Title: {
          title: [
            {
              text: { content: award.title },
            },
          ],
        },
        Organization: {
          rich_text: [
            {
              text: { content: award.org },
            },
          ],
        },
        Team: {
          rich_text: [
            {
              text: { content: award.team },
            },
          ],
        },
        Date: {
          rich_text: [
            {
              text: { content: award.date },
            },
          ],
        },
      },
    });
  }
  console.log(`✅ Awards Database created! ID: ${db.id}`);
  return db.id;
}

async function main() {
  try {
    const expDbId = await createExperienceDatabase(PARENT_PAGE_ID);
    const projDbId = await createProjectsDatabase(PARENT_PAGE_ID);
    const awardsDbId = await createAwardsDatabase(PARENT_PAGE_ID);

    console.log("\nMigration Complete! 🎉");
    console.log("Add the following to your .env.local file:");
    console.log(`NOTION_EXPERIENCE_DB_ID=${expDbId}`);
    console.log(`NOTION_PROJECTS_DB_ID=${projDbId}`);
    console.log(`NOTION_AWARDS_DB_ID=${awardsDbId}`);
  } catch (err) {
    console.error(err);
  }
}

main();
