import { verifyOAuth } from "@/lib/auth";
import { updateBlog } from "@/lib/integrations/notion";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyOAuth(req))) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Valid OAuth Bearer token required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Bad Request", message: "Page ID is required" },
        { status: 400 }
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

    // Validate fields if provided
    if (title !== undefined && typeof title !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'title' must be a string" },
        { status: 400 }
      );
    }
    if (slug !== undefined && typeof slug !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'slug' must be a string" },
        { status: 400 }
      );
    }
    if (date !== undefined && typeof date !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'date' must be a string" },
        { status: 400 }
      );
    }
    if (excerpt !== undefined && typeof excerpt !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'excerpt' must be a string" },
        { status: 400 }
      );
    }
    if (url !== undefined && typeof url !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'url' must be a string" },
        { status: 400 }
      );
    }

    // Must update at least one field
    if (
      title === undefined &&
      slug === undefined &&
      date === undefined &&
      excerpt === undefined &&
      url === undefined
    ) {
      return NextResponse.json(
        { error: "Bad Request", message: "At least one field to update must be provided" },
        { status: 400 }
      );
    }

    const updated = await updateBlog(id, { title, slug, date, excerpt, url });

    return NextResponse.json(updated, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update blog post in Notion", message: error.message },
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
      "Access-Control-Allow-Methods": "PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
