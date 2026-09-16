import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { readPrivateFile } from "@/lib/storage";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const authorized = await isAdminAuthenticated();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const note = await db.note.findUnique({
    where: { id },
    include: { subject: true, category: true },
  });

  if (!note || note.deletedAt) {
    return NextResponse.json({ error: "Preview not found." }, { status: 404 });
  }

  if (!note.pdfStorageKey) {
    console.error("[Admin Preview] Missing full PDF", { noteId: id, title: note.title });
    return NextResponse.json({ error: "Full note PDF is not available for this note." }, { status: 404 });
  }

  try {
    const file = await readPrivateFile(note.pdfStorageKey);
    const filename = `${note.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "note"}-full.pdf`;

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "private, no-store, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[Admin Preview] Failed to load full note PDF", {
      noteId: id,
      pdfKey: note.pdfStorageKey,
      error,
    });
    return NextResponse.json({ error: "Full note PDF is missing or unreadable." }, { status: 404 });
  }
}
