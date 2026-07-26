// Letter-grade ranking, modeled on the methodology publicly documented by
// anuraghazra/github-readme-stats (weighted percentile across commits, PRs,
// issues, reviews, stars, and followers using exponential/log-normal CDFs).
// This is our own implementation of that published formula, not a copy of
// their code — constants are the commonly-cited medians for that approach,
// so treat the exact grade as indicative rather than guaranteed-identical.

const MEDIANS = {
  commits: 1000,
  prs: 50,
  issues: 25,
  reviews: 2,
  stars: 50,
  followers: 10,
};

const WEIGHTS = {
  commits: 2,
  prs: 3,
  issues: 1,
  reviews: 1,
  stars: 4,
  followers: 1,
};

const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

// Lower rank number = better. 0 is the theoretical best.
const THRESHOLDS = [
  { max: 1, level: "S" },
  { max: 12.5, level: "A+" },
  { max: 25, level: "A" },
  { max: 37.5, level: "A-" },
  { max: 50, level: "B+" },
  { max: 62.5, level: "B" },
  { max: 75, level: "B-" },
  { max: 87.5, level: "C+" },
  { max: 100, level: "C" },
];

const exponentialCdf = (x) => 1 - Math.pow(2, -x);
const logNormalCdf = (x) => x / (1 + x);

export function calculateRank({ commits, prs, issues, reviews, stars, followers }) {
  const rank =
    1 -
    (WEIGHTS.commits * exponentialCdf(commits / MEDIANS.commits) +
      WEIGHTS.prs * exponentialCdf(prs / MEDIANS.prs) +
      WEIGHTS.issues * exponentialCdf(issues / MEDIANS.issues) +
      WEIGHTS.reviews * exponentialCdf(reviews / MEDIANS.reviews) +
      WEIGHTS.stars * logNormalCdf(stars / MEDIANS.stars) +
      WEIGHTS.followers * logNormalCdf(followers / MEDIANS.followers)) /
      TOTAL_WEIGHT;

  const percentile = rank * 100;
  const level = THRESHOLDS.find((t) => percentile <= t.max)?.level ?? "C";

  // For the ring: top percentile (rank≈0) should read as ~full circle.
  const progress = Math.max(0, Math.min(1, 1 - rank));

  return { level, percentile, progress };
}
