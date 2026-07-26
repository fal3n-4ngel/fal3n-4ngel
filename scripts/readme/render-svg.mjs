// Bespoke stats card — muted illustrated Japanese-pattern theme (Fuji, pine,
// plum blossom, seigaiha waves, torii), cream ground, ink linework.
// No third-party rendering service — every shape below is hand-drawn SVG.

const PALETTE = {
  cream: "#F1EBE0", // card ground
  ink: "#3B332C", // primary text, mountain silhouette, torii
  hai: "#8A8274", // muted caption gray
  sage: "#8B9A81", // pine
  indigo: "#5C7C97", // waves
  blush: "#D68F87", // plum blossom
};

const SERIF = `"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "Iowan Old Style", serif`;
const SANS = `"Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif`;
const MONO = `"JetBrains Mono", "SF Mono", "Cascadia Code", Consolas, ui-monospace, monospace`;

const WIDTH = 760;
const HEIGHT = 300;

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function seigaihaPattern(id, color, scale = 1) {
  const w = 40 * scale;
  const h = 20 * scale;
  return `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">
    <path d="M0,${h} A${w / 2},${w / 2} 0 0 1 ${w},${h}" fill="none" stroke="${color}" stroke-width="1.2" />
    <path d="M${-w / 4},${h} A${w / 4},${w / 4} 0 0 1 ${w / 4},${h}" fill="none" stroke="${color}" stroke-width="1" />
    <path d="M${w / 4},${h} A${w / 4},${w / 4} 0 0 1 ${(w * 3) / 4},${h}" fill="none" stroke="${color}" stroke-width="1" />
  </pattern>`;
}

function fujiIcon(cx, cy) {
  // Silhouette + snow-cap zigzag + a soft cloud band crossing the slope.
  return `
    <path d="M ${cx - 46},${cy + 34} L ${cx},${cy - 34} L ${cx + 46},${cy + 34} Z" fill="${PALETTE.ink}" />
    <path d="M ${cx - 14},${cy - 8} L ${cx - 7},${cy - 16} L ${cx - 2},${cy - 10} L ${cx + 2},${cy - 17} L ${cx + 7},${cy - 11} L ${cx + 14},${cy - 19} L ${cx + 20},${cy - 8} Z" fill="${PALETTE.cream}" />
    <ellipse cx="${cx - 10}" cy="${cy + 4}" rx="22" ry="6" fill="${PALETTE.cream}" opacity="0.85" />
    <ellipse cx="${cx + 18}" cy="${cy + 9}" rx="26" ry="6.5" fill="${PALETTE.cream}" opacity="0.85" />
  `;
}

function pineIcon(cx, cy) {
  const branch = (dy, w) => `
    <line x1="${cx}" y1="${cy + dy}" x2="${cx - w}" y2="${cy + dy - 7}" stroke="${PALETTE.sage}" stroke-width="2.2" stroke-linecap="round" />
    <line x1="${cx}" y1="${cy + dy}" x2="${cx + w}" y2="${cy + dy - 7}" stroke="${PALETTE.sage}" stroke-width="2.2" stroke-linecap="round" />
  `;
  return `
    <line x1="${cx}" y1="${cy - 26}" x2="${cx}" y2="${cy + 14}" stroke="${PALETTE.sage}" stroke-width="2.2" stroke-linecap="round" />
    ${branch(-22, 9)}
    ${branch(-10, 13)}
    ${branch(2, 16)}
  `;
}

function plumBlossomIcon(cx, cy, color = PALETTE.blush, r = 6) {
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const px = cx + Math.cos(rad) * r;
    const py = cy + Math.sin(rad) * r;
    return `<circle cx="${px}" cy="${py}" r="${r * 0.72}" fill="${color}" opacity="0.9" />`;
  });
  return `${petals.join("")}<circle cx="${cx}" cy="${cy}" r="${r * 0.32}" fill="${PALETTE.ink}" />`;
}

function toriiIcon(cx, cy, scale = 1) {
  const w = 34 * scale;
  const h = 30 * scale;
  return `
    <rect x="${cx - w / 2}" y="${cy - h / 2}" width="4" height="${h}" fill="${PALETTE.ink}" />
    <rect x="${cx + w / 2 - 4}" y="${cy - h / 2}" width="4" height="${h}" fill="${PALETTE.ink}" />
    <rect x="${cx - w / 2 - 6}" y="${cy - h / 2 - 2}" width="${w + 12}" height="4.5" fill="${PALETTE.ink}" />
    <rect x="${cx - w / 2 + 2}" y="${cy - h / 2 + 8}" width="${w - 4}" height="3.5" fill="${PALETTE.ink}" />
  `;
}

function gradeRing(cx, cy, r, progress, level, color) {
  const circumference = 2 * Math.PI * r;
  const dash = progress * circumference;
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${PALETTE.ink}" stroke-opacity="0.12" stroke-width="7" />
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"
      stroke-dasharray="${dash} ${circumference - dash}" transform="rotate(-90 ${cx} ${cy})" />
    <text x="${cx}" y="${cy + 8}" font-family='${SANS}' font-size="24" font-weight="700" fill="${PALETTE.ink}" text-anchor="middle">${level}</text>
  `;
}

export function renderStatsCard({ name, stats, year, rank }) {
  const rows = [
    { label: "Stars", value: stats.stars, dot: PALETTE.blush },
    { label: `Commits '${String(year).slice(2)}`, value: stats.commitsThisYear, dot: PALETTE.indigo },
    { label: "Pull Reqs", value: stats.pullRequests, dot: PALETTE.sage },
    { label: "Issues", value: stats.issues, dot: PALETTE.blush },
    { label: "Repos", value: stats.publicRepos, dot: PALETTE.indigo },
  ];

  const colLeft = 176;
  const listRight = 450;
  const rowStartY = 96;
  const rowGap = 34;

  const rowsSvg = rows
    .map((row, i) => {
      const y = rowStartY + i * rowGap;
      return `
        <circle cx="${colLeft}" cy="${y - 4}" r="2.6" fill="${row.dot}" />
        <text x="${colLeft + 14}" y="${y}" font-family='${MONO}' font-size="12" letter-spacing="1" fill="${PALETTE.hai}">${esc(row.label.toUpperCase())}</text>
        <text x="${listRight}" y="${y}" font-family='${MONO}' font-size="17" font-weight="600" fill="${PALETTE.ink}" text-anchor="end">${row.value}</text>
      `;
    })
    .join("");

  const ringCx = 590;
  const ringCy = rowStartY + ((rows.length - 1) * rowGap) / 2 - 4;

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub stats for ${esc(name)}">
  <defs>
    ${seigaihaPattern("waveStrip", PALETTE.indigo, 0.85)}
  </defs>

  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="${PALETTE.cream}" />
  <rect x="1" y="1" width="${WIDTH - 2}" height="${HEIGHT - 2}" fill="none" stroke="${PALETTE.ink}" stroke-opacity="0.16" stroke-width="1" />
  <line x1="150" y1="24" x2="150" y2="${HEIGHT - 24}" stroke="${PALETTE.ink}" stroke-opacity="0.14" stroke-width="1" />

  <!-- left illustration column -->
  ${plumBlossomIcon(112, 60)}
  ${pineIcon(48, 130)}
  ${fujiIcon(90, 210)}
  <rect x="26" y="246" width="112" height="16" fill="url(#waveStrip)" />

  <!-- right content -->
  <text x="${colLeft}" y="44" font-family='${SANS}' font-size="18" font-weight="700" letter-spacing="0.5" fill="${PALETTE.ink}">GitHub Stats</text>

  <line x1="${colLeft}" y1="60" x2="${WIDTH - 30}" y2="60" stroke="${PALETTE.ink}" stroke-opacity="0.16" stroke-width="1" />

  ${rowsSvg}
  ${gradeRing(ringCx, ringCy, 44, rank.progress, rank.level, PALETTE.indigo)}

  <text x="${colLeft}" y="${HEIGHT - 24}" font-family='${SERIF}' font-style="italic" font-size="10.5" fill="${PALETTE.hai}">numbers? meh.</text>
  <text x="${WIDTH - 70}" y="${HEIGHT - 24}" font-family='${MONO}' font-size="10" fill="${PALETTE.hai}" text-anchor="end">github.com/fal3n-4ngel</text>
  ${toriiIcon(WIDTH - 42, HEIGHT - 26, 0.62)}
</svg>`;
}
