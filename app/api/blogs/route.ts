import { verifyOAuth } from "@/lib/auth";
import { getBlogs, createBlog } from "@/lib/integrations/notion";
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
    const data = await getBlogs();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch blogs from Notion", message: error.message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyOAuth(req))) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Valid OAuth Bearer token required" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { title, slug, date, excerpt, url } = body;

    // Validate fields
    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "String field 'title' is required" },
        { status: 400 }
      );
    }
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "String field 'slug' is required" },
        { status: 400 }
      );
    }
    if (!date || typeof date !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "String field 'date' is required" },
        { status: 400 }
      );
    }
    if (!excerpt || typeof excerpt !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "String field 'excerpt' is required" },
        { status: 400 }
      );
    }
    if (url !== undefined && typeof url !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'url' must be a string" },
        { status: 400 }
      );
    }

    const created = await createBlog({ title, slug, date, excerpt, url });

    return NextResponse.json(created, {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create blog post in Notion", message: error.message },
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

