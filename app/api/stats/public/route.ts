import { fetchGithubData } from "@/lib/integrations/github";
import { getCalendarEvents, getAvailabilityStatus } from "@/lib/integrations/google-calendar";
import { getExperiences, getProjects } from "@/lib/integrations/notion";
import { getNowPlaying } from "@/lib/integrations/spotify";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [spotifyResult, githubResult, projectsResult, experiencesResult, calendarResult] =
      await Promise.allSettled([
        getNowPlaying(),
        fetchGithubData(),
        getProjects(),
        getExperiences(),
        getCalendarEvents(),
      ]);

    const spotify = spotifyResult.status === "fulfilled" ? spotifyResult.value : { isPlaying: false };
    
    const githubStats = githubResult.status === "fulfilled" ? githubResult.value : null;
    const github = githubStats
      ? {
          username: githubStats.username,
          publicRepos: githubStats.publicRepos,
          followers: githubStats.followers,
          totalStars: githubStats.totalStars,
        }
      : null;

    const notion = {
      projectsCount: projectsResult.status === "fulfilled" ? projectsResult.value.length : 0,
      experiencesCount: experiencesResult.status === "fulfilled" ? experiencesResult.value.length : 0,
    };

    const calendarEvents = calendarResult.status === "fulfilled" ? calendarResult.value : [];
    const rawAvailability = await getAvailabilityStatus(calendarEvents);
    
    const availability = {
      status: rawAvailability.status,
      currentEvent: rawAvailability.status === "Busy" ? (rawAvailability.currentEvent || "Busy") : undefined,
    };

    return NextResponse.json(
      {
        spotify,
        github,
        notion,
        availability,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to assemble consolidated stats", message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
