#!/usr/bin/env node
// Regenerates README.md and assets/stats-card.svg from live GitHub data.
// Run locally:  node scripts/readme/generate.mjs
// Run in CI:    same command, with GITHUB_TOKEN set to a PAT (see update-readme.yml)

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchReadmeData, humanize } from "./fetch-data.mjs";
import { renderStatsCard } from "./render-svg.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function renderList(items) {
  if (items.length === 0) return "_Nothing here yet._";
  return items
    .map((item) => {
      const desc = item.description ? ` — ${item.description}` : "";
      return `- [${item.repo}](${item.url})${desc} _(${humanize(item.at)})_`;
    })
    .join("\n");
}

function renderReadme(data) {
  return `<div>

# Adithya Krishnan 
*Developer | Cinephile | Weeb*
  
    💻 Current Focus: Personal developer tools, APIs, and frontend systems.
    🌐 Portfolio: www.adithyakrishnan.com

---

</div>

<img src="assets/stats-card.svg" alt="${data.name} — GitHub stats" width="700" />

<details>
<summary>🌱 Worklog</summary>
<br />

${renderList(data.worklog)}

</details>

<details>
<summary>🔥 Picks</summary>
<br />

${renderList(data.picks)}

</details>

<br />

<a href="https://www.buymeacoffee.com/fal3n4ngel" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
`;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const data = await fetchReadmeData(token);

  const svg = renderStatsCard(data);
  const assetsDir = path.join(ROOT, "assets");
  await mkdir(assetsDir, { recursive: true });
  await writeFile(path.join(assetsDir, "stats-card.svg"), svg, "utf8");

  const readme = renderReadme(data);
  await writeFile(path.join(ROOT, "README.md"), readme, "utf8");

  console.log(`✓ Wrote assets/stats-card.svg and README.md for ${data.name}`);
  console.log(`  stars=${data.stats.stars} commits=${data.stats.commitsThisYear} prs=${data.stats.pullRequests} issues=${data.stats.issues} repos=${data.stats.publicRepos}`);
}

main().catch((err) => {
  console.error("✗ README generation failed:", err.message);
  process.exit(1);
});
