import { config } from "dotenv";
config({ path: ".env.local" });

import { Client } from "@notionhq/client";
import { EXPERIENCE_DATA } from "../data/experience";
import { projects } from "../data/projects";

// Ensure you have these environment variables set
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID || "";

async function getExistingDatabaseId(parentId: string, title: string): Promise<string | null> {
  let cursor: string | undefined = undefined;
  while (true) {
    const response = await notion.blocks.children.list({
      block_id: parentId,
      start_cursor: cursor,
    });
    for (const block of response.results) {
      if (
        "type" in block &&
        block.type === "child_database" &&
        block.child_database.title === title
      ) {
        return block.id;
      }
    }
    if (!response.has_more) break;
    cursor = response.next_cursor ?? undefined;
  }
  return null;
}

async function createExperienceDatabase(parentId: string) {
  console.log("Checking for existing Experience Database...");
  const existingId = await getExistingDatabaseId(parentId, "Experience");
  if (existingId) {
    console.log(`⏭️  Experience Database already exists! ID: ${existingId}`);
    return existingId;
  }

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
  console.log("Checking for existing Projects Database...");
  const existingId = await getExistingDatabaseId(parentId, "Projects");
  if (existingId) {
    console.log(`⏭️  Projects Database already exists! ID: ${existingId}`);
    return existingId;
  }

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
  console.log("Checking for existing Awards Database...");
  const existingId = await getExistingDatabaseId(parentId, "Awards");
  if (existingId) {
    console.log(`⏭️  Awards Database already exists! ID: ${existingId}`);
    return existingId;
  }

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

async function createBlogsDatabase(parentId: string) {
  console.log("Checking for existing Blogs Database...");
  const existingId = await getExistingDatabaseId(parentId, "Blogs");
  if (existingId) {
    console.log(`⚠️ Archiving existing Blogs Database... ID: ${existingId}`);
    await notion.blocks.update({
      block_id: existingId,
      archived: true,
    });
  }

  console.log("Creating Blogs Database...");
  const db = await notion.databases.create({
    parent: {
      type: "page_id",
      page_id: parentId,
    },
    icon: {
      type: "emoji",
      emoji: "📝",
    },
    title: [
      {
        type: "text",
        text: {
          content: "Blogs",
        },
      },
    ],
    properties: {
      Title: {
        title: {},
      },
      Slug: {
        rich_text: {},
      },
      Date: {
        rich_text: {},
      },
      Excerpt: {
        rich_text: {},
      },
      URL: {
        url: {},
      },
      Order: {
        number: { format: "number" },
      },
    },
  });

  const blogsData = [
    {
      title: "My Journey into Web3",
      slug: "my-journey-into-web3",
      date: "Nov 2024",
      excerpt:
        "A deep dive into how I started exploring blockchain technologies and decentralized applications, leading to winning Hackathons and more.",
      url: "https://adithyakrishnan.com/blogs/my-journey-into-web3",
    },
    {
      title: "Building DASH: Desktop Adaptive Serverless Hosting",
      slug: "building-dash",
      date: "Aug 2024",
      excerpt:
        "Behind the scenes on how we built DASH, a P2P serverless alternative that significantly reduces compute overhead for edge computing workflows.",
      url: "https://adithyakrishnan.com/blogs/building-dash",
    },
  ];

  console.log("Populating Blogs Database...");
  for (let index = 0; index < blogsData.length; index++) {
    const blog = blogsData[index]!;
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Order: {
          number: index + 1,
        },
        Title: {
          title: [
            {
              text: { content: blog.title },
            },
          ],
        },
        Slug: {
          rich_text: [
            {
              text: { content: blog.slug },
            },
          ],
        },
        Date: {
          rich_text: [
            {
              text: { content: blog.date },
            },
          ],
        },
        Excerpt: {
          rich_text: [
            {
              text: { content: blog.excerpt },
            },
          ],
        },
        URL: {
          url: blog.url || null,
        },
      },
      children: [
        {
          object: "block",
          type: "heading_1",
          heading_1: {
            rich_text: [{ type: "text", text: { content: blog.title } }],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: blog.excerpt } }],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content:
                    "This is a full markdown integration. You can add more blocks directly onto this page inside Notion, like code snippets, toggles, images, and lists. Your Next.js portfolio will parse them securely!",
                },
              },
            ],
          },
        },
        {
          object: "block",
          type: "code",
          code: {
            language: "javascript",
            rich_text: [
              {
                type: "text",
                text: {
                  content:
                    "console.log('Hello from Notion API!');\nconst framework = 'Next.js';\nexport default framework;",
                },
              },
            ],
          },
        },
      ],
    });
  }
  console.log(`✅ Blogs Database created! ID: ${db.id}`);
  return db.id;
}

async function main() {
  try {
    const expDbId = await createExperienceDatabase(PARENT_PAGE_ID);
    const projDbId = await createProjectsDatabase(PARENT_PAGE_ID);
    const awardsDbId = await createAwardsDatabase(PARENT_PAGE_ID);
    const blogsDbId = await createBlogsDatabase(PARENT_PAGE_ID);

    console.log("\nMigration Complete! 🎉");
    console.log("Add the following to your .env.local file:");
    console.log(`NOTION_EXPERIENCE_DB_ID=${expDbId}`);
    console.log(`NOTION_PROJECTS_DB_ID=${projDbId}`);
    console.log(`NOTION_AWARDS_DB_ID=${awardsDbId}`);
    console.log(`NOTION_BLOGS_DB_ID=${blogsDbId}`);
  } catch (err) {
    console.error(err);
  }
}

main();
