import { fetchGithubData } from "@/lib/integrations/github";
import { getBlogs, getExperiences, getProjects } from "@/lib/integrations/notion";
import { getNowPlaying } from "@/lib/integrations/spotify";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch stats concurrently using Promise.allSettled for maximum fault tolerance
    const [spotifyResult, githubResult, blogsResult, projectsResult, experiencesResult] =
      await Promise.allSettled([
        getNowPlaying(),
        fetchGithubData(),
        getBlogs(),
        getProjects(),
        getExperiences(),
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

    return NextResponse.json(
      {
        spotify,
        github,
        notion,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
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
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
