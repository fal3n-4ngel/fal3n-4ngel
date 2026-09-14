import { EXPERIENCE_DATA } from "@/data/experience";
import { projects as LOCAL_PROJECTS } from "@/data/projects";
import { getAwards, getExperiences, getProjects } from "@/lib/integrations/notion";
import { NextResponse } from "next/server";

export const revalidate = 3600;

const SKILLS_DATA = {
  frameworks: "Next.js, React, Node.js, Express, Three.js",
  languages: "TypeScript, JavaScript, Python, C/C++, HTML/CSS, SQL",
  databases: "PostgreSQL, MongoDB, Redis, Firebase Firestore",
  styling: "Tailwind CSS, Framer Motion, GSAP, Radix UI",
  mobile: "React Native, Flutter",
};

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
}
## Links & Contact
- **Website:** https://www.adithyakrishnan.com
- **Book a Meeting:** https://www.adithyakrishnan.com/book
- **GitHub:** https://github.com/fal3n-4ngel
- **LinkedIn:** https://www.linkedin.com/in/fal3n-4ngel/
- **Email:** mailto:hello@adithyakrishnan.com
- **Resume:** https://www.adithyakrishnan.com/Resume_Adithya_Krishnan_sept.pdf
`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
