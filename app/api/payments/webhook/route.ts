import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRazorpayConfig } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature") || "";
    const body = await request.text();
    const { webhookSecret } = getRazorpayConfig();

    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 });
    }

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    const valid = crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));

    if (!valid) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    let payload: {
      event?: string;
      payload?: {
        payment?: { entity?: { id?: string; order_id?: string } };
        order?: { entity?: { id?: string } };
      };
    };
    try {
      payload = JSON.parse(body) as {
        event?: string;
        payload?: {
          payment?: { entity?: { id?: string; order_id?: string } };
          order?: { entity?: { id?: string } };
        };
      };
    } catch {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }

    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderEntity = payload?.payload?.order?.entity;

    if (event !== "payment.captured" && event !== "payment.authorized") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const paymentId = paymentEntity?.id || null;
    const orderId = orderEntity?.id || paymentEntity?.order_id || null;

    if (!paymentId || !orderId) {
      return NextResponse.json({ error: "Webhook payload missing payment/order data." }, { status: 400 });
    }

    const purchase = await db.purchase.findFirst({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    if (!purchase) {
      return NextResponse.json({ ok: true, ignored: true, message: "No matching purchase for webhook order." });
    }

    if (purchase.status === "PAID" && purchase.paymentId === paymentId) {
      return NextResponse.json({ ok: true, idempotent: true });
    }

    await db.purchase.update({
      where: { id: purchase.id },
      data: {
        paymentId,
        status: "PAID",
      },
    });

    return NextResponse.json({ ok: true, updated: true, orderId, paymentId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}
