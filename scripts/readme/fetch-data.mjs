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

async function graphql(token, query, variables) {
  const res = await fetch(`${API}/graphql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(`GraphQL error: ${JSON.stringify(body.errors ?? body)}`);
  return body.data;
}

const CONTRIB_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestReviewContributions
        restrictedContributionsCount
      }
    }
  }
`;

// GraphQL contributionsCollection only covers a 1-year window per call, so we
// walk year-by-year from account creation to now and sum. `restrictedContributionsCount`
// covers activity the token can't see the detail of (e.g. private repos without
// full `repo` scope) — included so the total isn't silently undercounted.
async function fetchAllTimeContributions(token, createdAt) {
  const startYear = new Date(createdAt).getUTCFullYear();
  const endYear = new Date().getUTCFullYear();

  let commits = 0;
  let reviews = 0;
  for (let year = startYear; year <= endYear; year++) {
    const from = `${year}-01-01T00:00:00Z`;
    const to = `${year}-12-31T23:59:59Z`;
    const data = await graphql(token, CONTRIB_QUERY, { login: USERNAME, from, to });
    const c = data.user.contributionsCollection;
    commits += c.totalCommitContributions + c.restrictedContributionsCount;
    reviews += c.totalPullRequestReviewContributions;
  }
  return { commits, reviews };
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

  // Needs a real token (not just unauthenticated) — falls back to this-year's
  // search-based commit count so local runs without a token still work.
  let allTimeCommits = commitSearch.total_count ?? 0;
  let reviews = 0;
  if (token) {
    try {
      const allTime = await fetchAllTimeContributions(token, profile.created_at);
      allTimeCommits = allTime.commits;
      reviews = allTime.reviews;
    } catch (err) {
      console.warn("⚠ all-time contributions unavailable, falling back to this year's count:", err.message);
    }
  }

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
      allTimeCommits,
      pullRequests: prSearch.total_count ?? 0,
      issues: issueSearch.total_count ?? 0,
      reviews,
      followers: profile.followers ?? 0,
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
