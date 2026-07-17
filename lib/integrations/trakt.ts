
const CLIENT_ID = process.env.TRAKT_CLIENT_ID;
const CLIENT_SECRET = process.env.TRAKT_CLIENT_SECRET;
const REDIRECT_URI = process.env.TRAKT_REDIRECT_URI;
const REFRESH_TOKEN = process.env.TRAKT_REFRESH_TOKEN;

const TRAKT_API_VERSION = "2";
const BASE_URL = "https://api.trakt.tv";

export interface TraktAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface WatchedItem {
  id: string;
  title: string;
  type: "movie" | "episode";
  year?: number;
  watchedAt: string;
  showTitle?: string;
  season?: number;
  episode?: number;
}

export interface WatchingStatus {
  isWatching: boolean;
  title?: string;
  type?: "movie" | "episode";
  year?: number;
  showTitle?: string;
  season?: number;
  episode?: number;
  lastWatchedAt?: string;
}

/**
 * Returns the Trakt authorization URL for OAuth flow.
 */
export const getTraktAuthUrl = (): string => {
  return `${BASE_URL}/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI || ""
  )}`;
};

/**
 * Exchanges the authorization code for access and refresh tokens.
 */
export const exchangeCodeForTokens = async (code: string): Promise<TraktAuthResponse> => {
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
};

/**
 * Obtains an access token using the stored refresh token.
 */
const getAccessToken = async (): Promise<string | null> => {
  if (!REFRESH_TOKEN) {
    console.warn("⚠️ TRAKT_REFRESH_TOKEN is not configured.");
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({
        refresh_token: REFRESH_TOKEN,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.error("❌ Failed to refresh Trakt token:", response.statusText);
      return null;
    }

    const data: TraktAuthResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("❌ Error refreshing Trakt token:", error);
    return null;
  }
};

let cachedWatching: WatchingStatus | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 15000; // 15 seconds cache

/**
 * Fetches the currently watching status from Trakt, falling back to recently watched history.
 */
export const getCurrentlyWatching = async (): Promise<WatchingStatus> => {
  const now = Date.now();
  if (cachedWatching && now - cacheTimestamp < CACHE_TTL) {
    return cachedWatching;
  }

  const defaultStatus: WatchingStatus = { isWatching: false };

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return defaultStatus;

    const headers = {
      "Content-Type": "application/json",
      "trakt-api-version": TRAKT_API_VERSION,
      "trakt-api-key": CLIENT_ID!,
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    // 1. Check currently watching status
    const watchingResponse = await fetch(`${BASE_URL}/users/me/watching`, {
      headers,
      cache: "no-store",
    });

    if (watchingResponse.status === 200) {
      const data = await watchingResponse.json();
      if (data) {
        if (data.type === "movie") {
          cachedWatching = {
            isWatching: true,
            title: data.movie.title,
            type: "movie",
            year: data.movie.year,
            lastWatchedAt: data.started_at,
          };
        } else if (data.type === "episode") {
          cachedWatching = {
            isWatching: true,
            title: data.episode.title,
            type: "episode",
            showTitle: data.show.title,
            season: data.episode.season,
            episode: data.episode.number,
            lastWatchedAt: data.started_at,
          };
        }
        cacheTimestamp = now;
        return cachedWatching!;
      }
    }

    // 2. Fallback to recently watched history if not actively watching
    const historyResponse = await fetch(`${BASE_URL}/users/me/history?limit=1`, {
      headers,
      cache: "no-store",
    });

    if (historyResponse.ok) {
      const history = await historyResponse.json();
      const lastItem = history?.[0];
      if (lastItem) {
        if (lastItem.type === "movie") {
          cachedWatching = {
            isWatching: false,
            title: lastItem.movie.title,
            type: "movie",
            year: lastItem.movie.year,
            lastWatchedAt: lastItem.watched_at,
          };
        } else if (lastItem.type === "episode") {
          cachedWatching = {
            isWatching: false,
            title: lastItem.episode.title,
            type: "episode",
            showTitle: lastItem.show.title,
            season: lastItem.episode.season,
            episode: lastItem.episode.number,
            lastWatchedAt: lastItem.watched_at,
          };
        }
        cacheTimestamp = now;
        return cachedWatching!;
      }
    }

    return defaultStatus;
  } catch (error) {
    console.error("❌ Error in Trakt getCurrentlyWatching:", error);
    return defaultStatus;
  }
};

/**
 * Searches Trakt for movies or TV shows.
 */
export const searchTrakt = async (query: string, type: "movie" | "show") => {
  try {
    const response = await fetch(`${BASE_URL}/search/${type}?query=${encodeURIComponent(query)}`, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": TRAKT_API_VERSION,
        "trakt-api-key": CLIENT_ID!,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
    });

    if (!response.ok) {
      throw new Error(`Trakt search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((item: any) => {
      const target = type === "movie" ? item.movie : item.show;
      return {
        id: target.ids.trakt,
        title: target.title,
        year: target.year,
        slug: target.ids.slug,
        type,
      };
    });
  } catch (error) {
    console.error(`❌ Trakt search error for ${type}:`, error);
    throw error;
  }
};

/**
 * Syncs a batch of watched movies and episodes to Trakt.
 */
export const syncBatchToTrakt = async (
  items: Array<{
    type: "movie" | "show";
    id: number;
    title: string;
    watched_at?: string;
    season?: number;
    episode?: number;
  }>
): Promise<any> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("No Trakt access token available.");

    const moviesPayload = items
      .filter((i) => i.type === "movie")
      .map((i) => ({
        watched_at: i.watched_at || new Date().toISOString(),
        title: i.title,
        ids: { trakt: i.id },
      }));

    const showsMap = new Map<number, { title: string; seasons: any[] }>();
    items
      .filter((i) => i.type === "show" && i.season !== undefined && i.episode !== undefined)
      .forEach((i) => {
        if (!showsMap.has(i.id)) {
          showsMap.set(i.id, { title: i.title, seasons: [] });
        }
        const show = showsMap.get(i.id)!;
        let season = show.seasons.find((s) => s.number === i.season);
        if (!season) {
          season = { number: i.season, episodes: [] };
          show.seasons.push(season);
        }
        season.episodes.push({
          number: i.episode,
          watched_at: i.watched_at || new Date().toISOString(),
        });
      });

    const showsPayload = Array.from(showsMap.entries()).map(([id, show]) => ({
      title: show.title,
      ids: { trakt: id },
      seasons: show.seasons,
    }));

    const response = await fetch(`${BASE_URL}/sync/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": TRAKT_API_VERSION,
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
      const errorText = await response.text();
      throw new Error(`Trakt sync failed: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("❌ Trakt sync batch error:", error);
    throw error;
  }
};
