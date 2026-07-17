import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load variables from .env.local first
dotenv.config({ path: path.resolve(".env.local") });

const CLIENT_ID = process.env.TRAKT_CLIENT_ID;
const CLIENT_SECRET = process.env.TRAKT_CLIENT_SECRET;
const REDIRECT_URI = process.env.TRAKT_REDIRECT_URI;
const BASE_URL = "https://api.trakt.tv";

const moviesList = [
  "Predestination",
  "Source Code",
  "Looper",
  "Inception",
  "Shutter Island",
  "The Prestige"
];

const fullyWatchedShows = [
  "Lost",
  "Dark",
  "Silo",
  "From",
  "Stranger Things",
  "Money Heist",
  "The Boroughs",
  "Dark Matter",
  "The Vampire Diaries",
  "The Originals",
  "Teen Wolf",
  "Lucifer",
  "Wednesday",
  "Locke & Key",
  "The Umbrella Academy",
  "How I Met Your Mother",
  "Brooklyn Nine-Nine",
  "Friends",
  "The Office",
  "Modern Family",
  "The Big Bang Theory"
];

const partiallyWatchedShows = [
  {
    title: "Supernatural",
    seasons: [
      { number: 1 },
      { number: 2 },
      { number: 3 },
      { number: 4 },
      { number: 5 }
    ]
  },
  {
    title: "Severance",
    seasons: [
      {
        number: 1,
        episodes: [{ number: 1 }, { number: 2 }, { number: 3 }]
      }
    ]
  },
  {
    title: "Fringe",
    seasons: [
      {
        number: 1,
        episodes: [{ number: 1 }]
      }
    ]
  }
];

async function exchangeCode(code: string) {
  console.log("Exchanging authorization code...");
  const response = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    body: JSON.stringify({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Trakt token exchange failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

async function searchTrakt(query: string, type: "movie" | "show") {
  const response = await fetch(`${BASE_URL}/search/${type}?query=${encodeURIComponent(query)}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID!,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
  });

  if (!response.ok) {
    throw new Error(`Search failed for ${query}: ${response.statusText}`);
  }

  const data = await response.json();
  return data[0]?.[type] || null;
}

async function main() {
  const code = "mzvcNhHZR3MJK8lX7iLyrYOXSGWNvco5";

  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("Missing Trakt client credentials in .env.local");
    }

    // 1. Exchange Code
    const tokens = await exchangeCode(code);
    console.log("✓ Successfully exchanged code for Trakt tokens!");
    
    const refreshToken = tokens.refresh_token;
    const accessToken = tokens.access_token;

    // 2. Write REFRESH_TOKEN to .env.local
    const envPath = path.resolve(".env.local");
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Check if TRAKT_REFRESH_TOKEN already exists
    if (envContent.includes("TRAKT_REFRESH_TOKEN=")) {
      envContent = envContent.replace(/TRAKT_REFRESH_TOKEN=.*/, `TRAKT_REFRESH_TOKEN=${refreshToken}`);
    } else {
      envContent += `\nTRAKT_REFRESH_TOKEN=${refreshToken}\n`;
    }
    
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("✓ Saved TRAKT_REFRESH_TOKEN to .env.local");

    // 3. Resolve and sync list
    console.log("\nResolving Movies...");
    const moviesPayload = [];
    for (const movieTitle of moviesList) {
      const match = await searchTrakt(movieTitle, "movie");
      if (match) {
        console.log(`✓ Resolved Movie: "${match.title}" (${match.year})`);
        moviesPayload.push({
          title: match.title,
          ids: { trakt: match.ids.trakt }
        });
      } else {
        console.warn(`⚠️ Could not resolve Movie: "${movieTitle}"`);
      }
    }

    console.log("\nResolving TV Shows...");
    const showsPayload = [];

    // Resolve fully watched shows
    for (const showTitle of fullyWatchedShows) {
      const match = await searchTrakt(showTitle, "show");
      if (match) {
        console.log(`✓ Resolved Show: "${match.title}" (${match.year})`);
        showsPayload.push({
          title: match.title,
          ids: { trakt: match.ids.trakt }
        });
      } else {
        console.warn(`⚠️ Could not resolve Show: "${showTitle}"`);
      }
    }

    // Resolve partially watched shows
    for (const partial of partiallyWatchedShows) {
      const match = await searchTrakt(partial.title, "show");
      if (match) {
        console.log(`✓ Resolved Partial Show: "${match.title}" (${match.year})`);
        showsPayload.push({
          title: match.title,
          ids: { trakt: match.ids.trakt },
          seasons: partial.seasons
        });
      } else {
        console.warn(`⚠️ Could not resolve Partial Show: "${partial.title}"`);
      }
    }

    console.log("\nSyncing watch history to Trakt...");
    const response = await fetch(`${BASE_URL}/sync/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({
        movies: moviesPayload,
        shows: showsPayload,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Trakt sync request failed: ${response.statusText} - ${errText}`);
    }

    const result = await response.json();
    console.log("\n✓ SUCCESS! Synchronized watch history successfully.");
    console.log("Added Movies:", result.added.movies);
    console.log("Added Episodes:", result.added.episodes);
  } catch (error) {
    console.error("\n❌ Error during execution:", error);
    process.exit(1);
  }
}

main();
