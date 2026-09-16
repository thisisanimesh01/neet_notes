import crypto from "crypto";

export type RazorpayOrderInput = {
  amount: number;
  currency?: string;
  receipt?: string;
};

export function getRazorpayConfig() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID?.trim() || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET?.trim() || "",
    publicKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || "",
  };
}

export function hasRazorpayCredentials() {
  const { keyId, keySecret, publicKey } = getRazorpayConfig();
  return Boolean(keyId && keySecret && publicKey);
}

export function verifySignature({ orderId, paymentId, signature, secret }: { orderId: string; paymentId: string; signature: string; secret: string }) {
  const generated = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(generated, "hex");
  const actualBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function createRazorpayOrder({ amount, currency = "INR", receipt }: RazorpayOrderInput) {
  const { keyId, keySecret } = getRazorpayConfig();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment variables.");
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt: receipt ?? `receipt_${Date.now()}`,
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.id) {
    const detail = payload?.error?.description || payload?.message || "Unknown Razorpay error";
    throw new Error(`Razorpay order creation failed: ${detail}`);
  }

  return payload as { id: string; amount: number; currency: string; receipt: string };
}
