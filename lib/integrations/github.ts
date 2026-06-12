import { unstable_cache } from "next/cache";

const GITHUB_USERNAME = "fal3n-4ngel";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export const fetchGithubData = unstable_cache(
  async () => {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Portfolio-API-Adithya",
    };

    if (GITHUB_TOKEN) {
      headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }

    // 1. Fetch User Profile
    const profileRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers,
      next: { revalidate: 300 },
    });

    if (!profileRes.ok) {
      throw new Error(`GitHub profile fetch failed: ${profileRes.statusText}`);
    }

    const profile = await profileRes.json();

    // 2. Fetch Repositories (up to 100)
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
      {
        headers,
        next: { revalidate: 300 },
      }
    );

    if (!reposRes.ok) {
      throw new Error(`GitHub repos fetch failed: ${reposRes.statusText}`);
    }

    const repos: any[] = await reposRes.json();

    // 3. Process data
    let totalStars = 0;
    const languagesMap: Record<string, number> = {};
    
    const recentRepos = repos
      .filter((repo) => !repo.fork)
      .slice(0, 6)
      .map((repo) => {
        totalStars += repo.stargazers_count;
        if (repo.language) {
          languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
        }
        return {
          name: repo.name,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          url: repo.html_url,
          updatedAt: repo.updated_at,
        };
      });

    // Calculate stars for remaining non-recent repos
    repos.forEach((repo) => {
      if (repo.fork) return;
      const inTop6 = recentRepos.some((r) => r.name === repo.name);
      if (!inTop6) {
        totalStars += repo.stargazers_count;
        if (repo.language) {
          languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
        }
      }
    });

    const sortedLanguages = Object.entries(languagesMap)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [key, val]) => {
        acc[key] = val;
        return acc;
      }, {} as Record<string, number>);

    return {
      username: profile.login,
      name: profile.name || profile.login,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      totalStars,
      languages: sortedLanguages,
      recentRepos,
    };
  },
  ["github-profile-stats"],
  { revalidate: 300, tags: ["github"] }
);
