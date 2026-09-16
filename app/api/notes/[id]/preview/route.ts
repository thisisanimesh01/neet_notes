import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readPreviewFile } from "@/lib/storage";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const note = await db.note.findUnique({
    where: { id },
    include: { subject: true, category: true },
  });

  if (!note || note.deletedAt || note.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Preview not found." }, { status: 404 });
  }

  if (!note.previewStorageKey) {
    return NextResponse.json({ error: "Preview is not available for this note." }, { status: 404 });
  }

  try {
    const file = await readPreviewFile(note.previewStorageKey);
    const filename = `${note.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "note"}-preview.pdf`;

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "private, no-store, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load preview." }, { status: 500 });
  }
}
