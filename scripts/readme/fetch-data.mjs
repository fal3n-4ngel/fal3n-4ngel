// Pulls everything the README needs straight from GitHub's REST/Search APIs.
// No third-party stats service — every number here is fetched and rendered by us.

const USERNAME = "fal3n-4ngel";
const API = "https://api.github.com";

function headers(token) {
  const h = { "User-Agent": "fal3n-4ngel-readme-gen", Accept: "application/vnd.github.v3+json" };
  if (token) h.Authorization = `token ${token}`;
  return h;
}

async function get(url, token, accept) {
  const res = await fetch(url, { headers: { ...headers(token), ...(accept && { Accept: accept }) } });
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchReadmeData(token) {
  const yearStart = `${new Date().getUTCFullYear()}-01-01`;

  const [profile, repos, prSearch, issueSearch, commitSearch, starred, events] = await Promise.all([
    get(`${API}/users/${USERNAME}`, token),
    get(`${API}/users/${USERNAME}/repos?per_page=100&sort=updated`, token),
    get(`${API}/search/issues?q=author:${USERNAME}+type:pr`, token),
    get(`${API}/search/issues?q=author:${USERNAME}+type:issue`, token),
    get(`${API}/search/commits?q=author:${USERNAME}+author-date:>=${yearStart}`, token, "application/vnd.github.cloak-preview+json"),
    get(`${API}/users/${USERNAME}/starred?per_page=6&sort=created&direction=desc`, token),
    get(`${API}/users/${USERNAME}/events/public?per_page=50`, token),
  ]);

  const stars = repos.filter((r) => !r.fork).reduce((sum, r) => sum + r.stargazers_count, 0);

  const worklog = dedupeByRepo(events.filter((e) => e.type === "PushEvent"))
    .slice(0, 5)
    .map((e) => ({
      repo: e.repo.name,
      url: `https://github.com/${e.repo.name}`,
      description: repos.find((r) => r.full_name === e.repo.name)?.description ?? "",
      at: e.created_at,
    }));

  const picks = starred
    .filter((r) => r.owner.login.toLowerCase() !== USERNAME.toLowerCase())
    .slice(0, 5)
    .map((r) => ({
      repo: r.full_name,
      url: r.html_url,
      description: r.description ?? "",
      at: r.starred_at ?? r.created_at,
    }));

  return {
    username: USERNAME,
    name: profile.name || USERNAME,
    stats: {
      stars,
      commitsThisYear: commitSearch.total_count ?? 0,
      pullRequests: prSearch.total_count ?? 0,
      issues: issueSearch.total_count ?? 0,
      publicRepos: profile.public_repos ?? repos.length,
    },
    year: new Date().getUTCFullYear(),
    worklog,
    picks,
  };
}

function dedupeByRepo(pushEvents) {
  const seen = new Set();
  const out = [];
  for (const e of pushEvents) {
    if (seen.has(e.repo.name)) continue;
    seen.add(e.repo.name);
    out.push(e);
  }
  return out;
}

export function humanize(isoDate) {
  const then = new Date(isoDate).getTime();
  const diffDays = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
