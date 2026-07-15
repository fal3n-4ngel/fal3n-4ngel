import { verifyOAuth } from "@/lib/auth";
import { fetchGithubData } from "@/lib/integrations/github";
import { getCalendarEvents, getAvailabilityStatus } from "@/lib/integrations/google-calendar";
import { getBlogs, getExperiences, getProjects } from "@/lib/integrations/notion";
import { getNowPlaying } from "@/lib/integrations/spotify";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyOAuth(req))) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Valid OAuth Bearer token required" },
        { status: 401 }
      );
    }
    // Fetch stats concurrently using Promise.allSettled for maximum fault tolerance
    const [spotifyResult, githubResult, blogsResult, projectsResult, experiencesResult, calendarResult] =
      await Promise.allSettled([
        getNowPlaying(),
        fetchGithubData(),
        getBlogs(),
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
      blogsCount: blogsResult.status === "fulfilled" ? blogsResult.value.length : 0,
      projectsCount: projectsResult.status === "fulfilled" ? projectsResult.value.length : 0,
      experiencesCount: experiencesResult.status === "fulfilled" ? experiencesResult.value.length : 0,
    };

    const calendarEvents = calendarResult.status === "fulfilled" ? calendarResult.value : [];
    const availability = await getAvailabilityStatus(calendarEvents);


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
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
        },
      }


    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to assemble consolidated stats", message: error.message },
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
