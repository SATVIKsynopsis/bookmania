import { NextResponse } from "next/server";
import Razorpay from "razorpay";


if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Missing Razorpay environment variables.");
}


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount, currency, itemId, ticketCount, paymentMethod, upiVpa, itemType } = await request.json();

    // Validate required fields
    if (!amount || !itemId || !ticketCount || !itemType) {
      return NextResponse.json(
        { error: "Missing required fields: amount, itemId, ticketCount, or itemType" },
        { status: 400 }
      );
    }

 
    if (!["movie", "sport"].includes(itemType)) {
      return NextResponse.json(
        { error: "Invalid itemType. Must be 'movie' or 'sport'." },
        { status: 400 }
      );
    }

  
    if (paymentMethod && paymentMethod !== "upi") {
      return NextResponse.json(
        { error: "Unsupported payment method. Only 'upi' is supported." },
        { status: 400 }
      );
    }

    
    if (upiVpa && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiVpa)) {
      return NextResponse.json(
        { error: "Invalid UPI VPA format. Example: name@upi" },
        { status: 400 }
      );
    }

  
    const amountInPaise = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountInPaise) || amountInPaise <= 0) {
      return NextResponse.json(
        { error: "Invalid amount: must be a positive number" },
        { status: 400 }
      );
    }

  
    const shortItemId = itemId.slice(0, 12);
    const shortTimestamp = Date.now().toString().slice(-6);
    const receipt = `item_${shortItemId}_${shortTimestamp}`.slice(0, 40);

    
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || "INR",
      receipt,
      notes: { itemId, ticketCount, itemType }, 
      payment_capture: 1, 
    });

    
    let upiData = null;
    if (paymentMethod === "upi" && upiVpa) {
      upiData = {
        vpa: upiVpa,
        instructions: "Complete payment using your UPI app.",
      };
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      upi: upiData,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}