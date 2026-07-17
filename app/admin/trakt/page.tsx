"use client";

import { CustomCursor } from "@/components/layout/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import { useFollowPointer } from "@/hooks";
import React, { useEffect, useRef, useState } from "react";
import {
  RiAddLine,
  RiCalendarLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiFilmLine,
  RiLoader4Line,
  RiMovieLine,
  RiSearchLine,
  RiTvLine,
} from "react-icons/ri";

interface SearchResult {
  id: number;
  title: string;
  year?: number;
  slug: string;
  type: "movie" | "show";
}

interface StagedItem {
  id: number;
  title: string;
  type: "movie" | "show";
  watched_at: string; // ISO string
  season?: number;
  episode?: number;
}

export default function AdminTraktPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useFollowPointer(ref);

  const [apiKey, setApiKey] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authInput, setAuthInput] = useState<string>("");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"movie" | "show">("movie");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // TV show episode staging inputs
  const [episodeInputs, setEpisodeInputs] = useState<Record<number, { season: number; episode: number }>>({});

  // Batch states
  const [batchItems, setBatchItems] = useState<StagedItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load API Key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("admin_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authInput.trim()) {
      localStorage.setItem("admin_api_key", authInput.trim());
      setApiKey(authInput.trim());
      setIsAuthenticated(true);
      setErrorMessage(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_api_key");
    setApiKey("");
    setIsAuthenticated(false);
    setSearchResults([]);
    setBatchItems([]);
  };

  // Search movies/shows
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/trakt/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          throw new Error("Unauthorized: Invalid API Key");
        }
        const data = await res.json();
        throw new Error(data.message || "Failed to search");
      }

      const data = await res.json();
      setSearchResults(data);

      // Initialize episode inputs for TV shows
      const inputs: typeof episodeInputs = {};
      data.forEach((item: SearchResult) => {
        if (item.type === "show") {
          inputs[item.id] = { season: 1, episode: 1 };
        }
      });
      setEpisodeInputs(prev => ({ ...prev, ...inputs }));
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setIsSearching(false);
    }
  };

  // Add search result to batch staging area
  const addToBatch = (item: SearchResult) => {
    const defaultDate = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    const newItem: StagedItem = {
      id: item.id,
      title: item.title,
      type: item.type,
      watched_at: defaultDate,
    };

    if (item.type === "show") {
      const inputs = episodeInputs[item.id] || { season: 1, episode: 1 };
      newItem.season = inputs.season;
      newItem.episode = inputs.episode;
    }

    setBatchItems((prev) => [...prev, newItem]);

    // Increment episode number automatically for easy batch entries of consecutive episodes
    if (item.type === "show") {
      setEpisodeInputs((prev) => {
        const current = prev[item.id] || { season: 1, episode: 1 };
        return {
          ...prev,
          [item.id]: {
            ...current,
            episode: current.episode + 1,
          },
        };
      });
    }
  };

  const updateBatchItemDate = (index: number, dateVal: string) => {
    setBatchItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].watched_at = dateVal;
      }
      return updated;
    });
  };

  const removeBatchItem = (index: number) => {
    setBatchItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Sync staged batch items to Trakt history
  const handleSyncBatch = async () => {
    if (batchItems.length === 0) return;

    setIsSyncing(true);
    setErrorMessage(null);
    setSyncSuccess(false);

    try {
      // Map staged timestamps back to standard ISO
      const payloadItems = batchItems.map((item) => ({
        ...item,
        watched_at: new Date(item.watched_at).toISOString(),
      }));

      const res = await fetch("/api/trakt/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ items: payloadItems }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          throw new Error("Unauthorized: Session Expired");
        }
        const data = await res.json();
        throw new Error(data.message || "Failed to sync batch");
      }

      setSyncSuccess(true);
      setBatchItems([]);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="h-full min-h-screen w-full text-white bg-black selection:bg-white selection:text-black" ref={ref}>
      <CustomCursor x={x} y={y} isEscaping={false} />
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        {/* Auth prompt */}
        {!isAuthenticated ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c0e]/80 p-8 shadow-2xl backdrop-blur-xl">
              <h2 className="text-2xl font-bold tracking-tight text-white mb-6 text-center">
                Trakt Manager Access
              </h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="apiKey" className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                    Admin API Key
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    value={authInput}
                    onChange={(e) => setAuthInput(e.target.value)}
                    placeholder="Enter private API key..."
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors"
                >
                  Authenticate
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-white/15 pb-6 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Trakt Integration Manager</h1>
                <p className="text-sm text-zinc-400 mt-1">Search, track, and batch log your movie & series history.</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/api/auth/trakt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors"
                >
                  Re-Authenticate Trakt
                </a>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-white/15 hover:bg-white/5 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                {errorMessage}
              </div>
            )}

            {/* Content grid */}
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left Column: Search & Add */}
              <div className="space-y-6 lg:col-span-7">
                <div className="rounded-2xl border border-white/10 bg-[#0c0c0e]/60 p-6 backdrop-blur-xl">
                  <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                    <RiSearchLine className="text-zinc-400" /> Lookup Movies & Shows
                  </h2>

                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSearchType("movie")}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                          searchType === "movie"
                            ? "bg-white text-black"
                            : "border border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <RiMovieLine /> Movie
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchType("show")}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                          searchType === "show"
                            ? "bg-white text-black"
                            : "border border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <RiTvLine /> TV Show
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${searchType === "movie" ? "movies" : "tv shows"} on Trakt...`}
                        className="flex-1 rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isSearching}
                        className="flex items-center justify-center p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors disabled:opacity-50"
                      >
                        {isSearching ? <RiLoader4Line className="animate-spin" /> : <RiSearchLine />}
                      </button>
                    </div>
                  </form>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-6 border-t border-white/10 pt-4 space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/20 p-3 hover:border-white/10 transition-colors"
                        >
                          <div className="flex-1 min-w-[200px]">
                            <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">{item.year || "N/A"}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Season/Episode inputs for TV Shows */}
                            {item.type === "show" && (
                              <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                                <span>S</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={episodeInputs[item.id]?.season || 1}
                                  onChange={(e) =>
                                    setEpisodeInputs((prev) => ({
                                      ...prev,
                                      [item.id]: {
                                        ...(prev[item.id] || { episode: 1 }),
                                        season: parseInt(e.target.value) || 1,
                                      },
                                    }))
                                  }
                                  className="w-10 rounded border border-white/10 bg-black/40 p-1 text-center font-semibold text-white"
                                />
                                <span>E</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={episodeInputs[item.id]?.episode || 1}
                                  onChange={(e) =>
                                    setEpisodeInputs((prev) => ({
                                      ...prev,
                                      [item.id]: {
                                        ...(prev[item.id] || { season: 1 }),
                                        episode: parseInt(e.target.value) || 1,
                                      },
                                    }))
                                  }
                                  className="w-10 rounded border border-white/10 bg-black/40 p-1 text-center font-semibold text-white"
                                />
                              </div>
                            )}

                            <button
                              onClick={() => addToBatch(item)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded bg-zinc-800 hover:bg-white hover:text-black transition-all"
                            >
                              <RiAddLine /> Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isSearching && searchQuery && searchResults.length === 0 && (
                    <p className="text-center text-xs text-zinc-500 py-6">No results found.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Batch Staging Area */}
              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-2xl border border-white/10 bg-[#0c0c0e]/60 p-6 backdrop-blur-xl flex flex-col h-full min-h-[350px]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                      <RiFilmLine className="text-zinc-400" /> Staged Batch ({batchItems.length})
                    </h2>
                    {batchItems.length > 0 && (
                      <button
                        onClick={() => setBatchItems([])}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-1">
                    {batchItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-16 text-center text-zinc-600">
                        <RiFilmLine className="text-4xl mb-3" />
                        <p className="text-sm">Staging area is empty.</p>
                        <p className="text-xs mt-1">Search and add movies or TV episodes on the left.</p>
                      </div>
                    ) : (
                      batchItems.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="group relative rounded-xl border border-white/5 bg-black/20 p-3 flex flex-col gap-2 hover:border-white/10 transition-colors"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-sm font-semibold text-white truncate max-w-[220px]">
                                {item.title}
                              </h3>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                                {item.type === "movie" ? "Movie" : `Show • S${String(item.season).padStart(2, "0")}E${String(item.episode).padStart(2, "0")}`}
                              </p>
                            </div>
                            <button
                              onClick={() => removeBatchItem(index)}
                              className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors"
                            >
                              <RiDeleteBinLine className="text-sm" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <RiCalendarLine />
                            <input
                              type="datetime-local"
                              value={item.watched_at}
                              onChange={(e) => updateBatchItemDate(index, e.target.value)}
                              className="rounded border border-white/5 bg-black/50 p-1 text-zinc-300 focus:outline-none focus:border-white/10"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {batchItems.length > 0 && (
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <button
                        onClick={handleSyncBatch}
                        disabled={isSyncing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:opacity-50 text-white font-semibold text-sm transition-all"
                      >
                        {isSyncing ? (
                          <>
                            <RiLoader4Line className="animate-spin text-lg" /> Syncing to Trakt...
                          </>
                        ) : (
                          <>Sync Batch to Trakt</>
                        )}
                      </button>
                    </div>
                  )}

                  {syncSuccess && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 py-2 rounded-lg">
                      <RiCheckLine /> Batch synced successfully!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
