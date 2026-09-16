import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createRazorpayOrder, getRazorpayConfig, hasRazorpayCredentials } from "@/lib/razorpay";
import { purchaseSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = purchaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid purchase request." }, { status: 400 });
    }

    const { noteId } = parsed.data;
    const note = await db.note.findUnique({
      where: { id: noteId },
    });

    if (!note || note.deletedAt || note.status !== "PUBLISHED") {
      return NextResponse.json({ error: "This note is not available for purchase." }, { status: 404 });
    }

    if (!hasRazorpayCredentials()) {
      const { publicKey } = getRazorpayConfig();
      return NextResponse.json(
        {
          error: "Payment gateway is not configured. Please contact support.",
          missing: !publicKey,
        },
        { status: 503 },
      );
    }

    const amountInPaise = note.price * 100;
    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: `note_${note.id}`,
    });

    const purchase = await db.purchase.create({
      data: {
        noteId: note.id,
        orderId: razorpayOrder.id,
        amount: note.price,
        currency: "INR",
        status: "PENDING",
        customerName: "Guest",
        customerEmail: "guest@localhost",
      },
    });

    return NextResponse.json({
      ok: true,
      noteId: note.id,
      orderId: razorpayOrder.id,
      purchaseId: purchase.id,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      message: "Razorpay order created successfully.",
    });
  } catch (error) {
    console.error("[Purchase API Error] Failed to process purchase initialization:", error);
    return NextResponse.json(
      { error: "Something went wrong while starting your payment. Please try again in a moment." },
      { status: 500 }
    );
  }
}
