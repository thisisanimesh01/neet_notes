import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRazorpayConfig, verifySignature } from "@/lib/razorpay";
import { paymentVerifySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = paymentVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment verification payload." }, { status: 400 });
    }

    const { noteId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const note = await db.note.findUnique({ where: { id: noteId } });
    if (!note || note.deletedAt || note.status === "DRAFT") {
      return NextResponse.json({ error: "This note is not available for purchase." }, { status: 404 });
    }

    const { keySecret } = getRazorpayConfig();
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay secret is not configured in this environment." }, { status: 503 });
    }

    const valid = verifySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      secret: keySecret,
    });

    if (!valid) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const purchase = await db.purchase.findFirst({
      where: {
        noteId,
        orderId: razorpay_order_id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase record not found for this order." }, { status: 404 });
    }

    if (purchase.status === "PAID") {
      return NextResponse.json({ ok: true, orderId: razorpay_order_id, paymentId: razorpay_payment_id, idempotent: true });
    }

    await db.purchase.update({
      where: { id: purchase.id },
      data: {
        paymentId: razorpay_payment_id,
        status: "PAID",
      },
    });

    return NextResponse.json({ ok: true, orderId: razorpay_order_id, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Payment verification failed." }, { status: 500 });
  }
}
