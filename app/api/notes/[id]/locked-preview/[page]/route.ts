
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function makeBlurredPlaceholder(width = 900, height = 1200) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <filter id="blur"><feGaussianBlur stdDeviation="18" /></filter>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <g filter="url(#blur)">
        <rect x="70" y="120" width="760" height="90" rx="20" fill="#94a3b8" opacity="0.7"/>
        <rect x="70" y="260" width="760" height="70" rx="18" fill="#b8c3d1" opacity="0.8"/>
        <rect x="70" y="375" width="760" height="70" rx="18" fill="#b8c3d1" opacity="0.8"/>
        <rect x="70" y="490" width="760" height="70" rx="18" fill="#b8c3d1" opacity="0.8"/>
        <rect x="70" y="605" width="760" height="70" rx="18" fill="#b8c3d1" opacity="0.8"/>
        <rect x="70" y="720" width="760" height="70" rx="18" fill="#b8c3d1" opacity="0.8"/>
        <rect x="70" y="835" width="760" height="70" rx="18" fill="#b8c3d1" opacity="0.8"/>
      </g>
      <rect x="0" y="0" width="100%" height="100%" fill="rgba(15,23,42,0.18)"/>
      <g fill="#ffffff" opacity="0.9">
        <circle cx="450" cy="1040" r="90" fill="rgba(255,255,255,0.15)"/>
      </g>
    </svg>
  `;

  return Buffer.from(
    `<?xml version="1.0" encoding="UTF-8"?>${svg}`,
  );
}

export async function GET(request: Request, context: { params: Promise<{ id: string; page: string }> }) {
  const { id, page } = await context.params;
  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber < 3) {
    return NextResponse.json({ error: "Invalid page." }, { status: 400 });
  }

  const note = await db.note.findUnique({
    where: { id },
    include: { subject: true, category: true },
  });

  if (!note || note.deletedAt || note.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  if (pageNumber > note.pageCount) {
    return NextResponse.json({ error: "Page out of range." }, { status: 404 });
  }

  try {
    const svg = makeBlurredPlaceholder();
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "private, no-store, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[Locked preview] Failed to create placeholder", { noteId: id, pageNumber, error });
    return NextResponse.json({ error: "Locked preview unavailable." }, { status: 500 });
  }
}
