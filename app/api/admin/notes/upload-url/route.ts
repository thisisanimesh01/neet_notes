import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createPrivatePdfUploadUrl } from "@/lib/storage";

export async function POST(request: Request) {
  const authorized = await isAdminAuthenticated();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let fileSize = 0;
    let fileName = "";
    try {
      const body = await request.json();
      fileSize = Number(body?.fileSize || 0);
      fileName = String(body?.fileName || "");
    } catch {
      // Body is optional
    }

    // Maximum 50 MB
    if (fileSize > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File is too large. Maximum allowed size is 50 MB." },
        { status: 400 }
      );
    }

    if (fileName && !fileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    const { storageKey, signedUrl } = await createPrivatePdfUploadUrl();

    return NextResponse.json({
      success: true,
      storageKey,
      signedUrl,
    });
  } catch (error) {
    console.error("[Upload URL Generation Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to generate upload URL.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
