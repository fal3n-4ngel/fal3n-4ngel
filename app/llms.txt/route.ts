import { EXPERIENCE_DATA } from "@/data/experience";
import { projects as LOCAL_PROJECTS } from "@/data/projects";
import { SKILLS_DATA } from "@/data/skills";
import { getAwards, getBlogs, getExperiences, getProjects } from "@/lib/integrations/notion";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  let experiences = await getExperiences().catch(() => []);
  if (!experiences || experiences.length === 0) {
    experiences = EXPERIENCE_DATA;
  }

  let projectsList = await getProjects().catch(() => []);
  if (!projectsList || projectsList.length === 0) {
    projectsList = LOCAL_PROJECTS;
  }

  const awardsList = await getAwards().catch(() => []);
  const blogsList = await getBlogs().catch(() => []);

  const markdown = `# Adithya Krishnan

> Software Engineer specializing in full-stack web development, cloud architecture, and modern scalable web technologies. Currently Software Engineer at Equifax.

## Work Experience
${experiences
  .map(
    (exp) =>
      `- **${exp.title}** at [${exp.company}](${exp.companyUrl || "#"}) (${exp.period})`
  )
  .join("\n")}

## Technical Skills
- **Frameworks & Libraries:** ${SKILLS_DATA.frameworks}
- **Languages:** ${SKILLS_DATA.languages}
- **Databases & Storage:** ${SKILLS_DATA.databases}
- **Styling & UI:** ${SKILLS_DATA.styling}
- **Mobile Development:** ${SKILLS_DATA.mobile}

## Key Projects
${projectsList
  .map(
    (p) =>
      `- **[${p.name}](${p.view})** (${p.type || "Project"}${p.date ? ` - ${p.date}` : ""}): ${p.description}`
  )
  .join("\n")}
${
  awardsList && awardsList.length > 0
    ? `\n## Awards & Recognition\n` +
      awardsList
        .map(
          (a) => `- **${a.title}** - ${a.org} (${a.team ? `${a.team}, ` : ""}${a.date})`
        )
        .join("\n")
    : ""
}${
  blogsList && blogsList.length > 0
    ? `\n## Blog Posts\n` +
      blogsList
        .map(
          (b) =>
            `- [${b.title}](https://www.adithyakrishnan.com/blogs/${b.id}) (${b.date}): ${b.excerpt}`
        )
        .join("\n")
    : ""
}
## Links & Contact
- **Website:** https://www.adithyakrishnan.com
- **GitHub:** https://github.com/fal3n-4ngel
- **LinkedIn:** https://www.linkedin.com/in/fal3n-4ngel/
- **Email:** mailto:adiadithyakrishnan@gmail.com
- **Resume:** https://www.adithyakrishnan.com/Resume_Adithya_Krishnan.pdf
`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
