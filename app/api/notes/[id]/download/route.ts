import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readPrivateFile } from "@/lib/storage";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  const note = await db.note.findUnique({
    where: { id },
    include: { subject: true, category: true },
  });

  if (!note || note.deletedAt) {
    return NextResponse.json({ error: "Note not available." }, { status: 404 });
  }

  const paidPurchase = await db.purchase.findFirst({
    where: {
      noteId: id,
      status: "PAID",
      ...(orderId ? { orderId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  if (!paidPurchase) {
    if (note.status === "DRAFT") {
      return NextResponse.json({ error: "Download unavailable." }, { status: 404 });
    }
    return NextResponse.json({ error: "Payment verification failed." }, { status: 403 });
  }

  try {
    const file = await readPrivateFile(note.pdfStorageKey);
    const filename = `${note.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "note"}.pdf`;

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load note." }, { status: 500 });
  }
}
