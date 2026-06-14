"use client";

import { useEffect, useState } from "react";

export interface LanyardActivity {
  type: number;
  name: string;
  details?: string;
  state?: string;
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  timestamps?: {
    start?: number;
    end?: number;
  };
}

export interface LanyardData {
  discord_status: "online" | "idle" | "dnd" | "offline";
  listening_to_spotify: boolean;
  activities: LanyardActivity[];
}

export const useLanyard = (userId: string) => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchLanyard = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data) {
            setData({
              discord_status: json.data.discord_status,
              listening_to_spotify: json.data.listening_to_spotify,
              activities: json.data.activities || [],
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch Lanyard status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLanyard();
    // Poll every 15 seconds to keep overhead low but responsive
    const interval = setInterval(fetchLanyard, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  return { data, loading };
};
