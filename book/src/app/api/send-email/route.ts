import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, itemTitle, date, venue, ticketCount, totalPrice, paymentId } = await request.json();

    if (!to || !itemTitle || !date || !venue || !ticketCount || !totalPrice || !paymentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #F97316; text-align: center;">Booking Confirmation</h2>
        <p style="color: #333; font-size: 16px; text-align: center;">
          Thank you for your booking! Here are the details of your event.
        </p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; font-size: 18px; margin-bottom: 10px;">${itemTitle}</h3>
          <p style="color: #555; margin: 5px 0;">
            <strong>Date:</strong> ${
              date
                ? new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "TBD"
            }
          </p>
          <p style="color: #555; margin: 5px 0;">
            <strong>Venue:</strong> ${venue || "TBD"}
          </p>
          <p style="color: #555; margin: 5px 0;">
            <strong>Tickets:</strong> ${ticketCount} Ticket${ticketCount > 1 ? "s" : ""}
          </p>
          <p style="color: #555; margin: 5px 0;">
            <strong>Total Price:</strong> ₹${totalPrice.toFixed(2)}
          </p>
          <p style="color: #555; margin: 5px 0;">
            <strong>Payment ID:</strong> ${paymentId}
          </p>
          <p style="color: #555; margin: 5px 0;">
            <strong>Booked on:</strong> ${new Date().toLocaleString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </p>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">
          We’re excited to see you at the event! If you have any questions, feel free to contact us at 
          <a href="mailto:support@yourapp.com" style="color: #F97316; text-decoration: none;">support@yourapp.com</a>.
        </p>
        <p style="color: #777; font-size: 14px; text-align: center;">
          Note: Tickets are non-refundable once booked.
        </p>
      </div>
    `;

    const data = await resend.emails.send({
      from: "Event Booking <nothinglikemuch.com>", 
      to: to,
      subject: `Booking Confirmation for ${itemTitle}`,
      html: emailContent,
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}