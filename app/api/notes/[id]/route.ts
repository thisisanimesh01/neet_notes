import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing note ID." }, { status: 400 });
    }

    const note = await db.note.findUnique({
      where: { id },
      include: {
        subject: true,
        category: true,
      },
    });

    if (!note || note.deletedAt || note.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "This note is not available." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      note: {
        id: note.id,
        title: note.title,
        chapterName: note.chapterName,
        description: note.description,
        pageCount: note.pageCount,
        price: note.price,
        status: note.status,
        subject: {
          id: note.subject.id,
          name: note.subject.name,
          slug: note.subject.slug,
        },
        category: {
          id: note.category.id,
          name: note.category.name,
          slug: note.category.slug,
        },
      },
    });
  } catch (error) {
    console.error("[API Notes ID] Error retrieving note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note details." },
      { status: 500 }
    );
  }
}
