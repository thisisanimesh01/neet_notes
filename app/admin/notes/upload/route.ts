import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { createPrivatePdfUploadUrl } from "@/lib/storage";

export async function POST() {
  const authorized = await isAdminAuthenticated();

  if (!authorized) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { storageKey, signedUrl } =
      await createPrivatePdfUploadUrl();

    return NextResponse.json({
      success: true,
      storageKey,
      signedUrl,
    });
  } catch (error) {
    console.error(
      "[Admin Notes Signed Upload Error]:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create upload URL.";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}