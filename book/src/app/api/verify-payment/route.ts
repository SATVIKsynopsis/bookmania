import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";


if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Missing Razorpay environment variables.");
}

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_BASE_URL environment variable.");
}


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json();

   
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required fields: razorpay_payment_id, razorpay_order_id, or razorpay_signature" },
        { status: 400 }
      );
    }

  
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed: Invalid signature" },
        { status: 400 }
      );
    }

    
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (!order) {
      return NextResponse.json(
        { error: "Failed to fetch order details from Razorpay" },
        { status: 500 }
      );
    }

    const itemId = order.notes?.itemId;
    const ticketCount = order.notes?.ticketCount;
    const itemType = order.notes?.itemType;

    if (!itemId || !ticketCount || !itemType) {
      return NextResponse.json(
        { error: "Missing itemId, ticketCount, or itemType in order notes" },
        { status: 400 }
      );
    }

    if (!["movie", "sport"].includes(itemType)) {
      return NextResponse.json(
        { error: "Invalid itemType in order notes. Must be 'movie' or 'sport'." },
        { status: 400 }
      );
    }

    
    const endpoint = itemType === "movie" ? "movies" : "sports";
    const itemResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/${endpoint}/${itemId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!itemResponse.ok) {
      const errorText = await itemResponse.text();
      console.error(`${itemType} fetch error:`, errorText);
      throw new Error(`Failed to fetch ${itemType} details: ${errorText}`);
    }

    const item = await itemResponse.json();
    console.log(`${itemType} details:`, item);

    
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/${endpoint}/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        availableSeats: item.availableSeats - ticketCount,
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`Failed to update ${itemType} seats:`, errorText);
     
    }

    return NextResponse.json(
      { status: "success", message: "Payment verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}