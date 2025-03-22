"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";

type Item = {
  _id: string;
  title: string;
  date: string;
  venue: string;
  price: number;
  availableSeats: number;
  image: string;
};

type CheckoutProps = {
  item: Item;
  ticketCount: number;
  onClose: () => void;
  user: any;
  itemType: "movie" | "sport";
};

const Checkout = ({ item, ticketCount, onClose, user, itemType }: CheckoutProps) => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");

  const totalPrice = (item.price * ticketCount).toFixed(2);
  const isTestMode = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_test");

  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const amountToUse = isTestMode ? totalPrice : "1.00";

      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountToUse,
          currency: "INR",
          itemId: item._id,
          ticketCount,
          paymentMethod: "upi",
          upiVpa: upiId || undefined,
          itemType, 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create Razorpay order");
      }

      const { orderId, amount, currency, upi } = await response.json();

      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
        });
      }

      const prefillData = {
        name: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "",
        contact: user?.phoneNumbers?.[0]?.phoneNumber || "",
      };

      if (upiId) {
        prefillData.vpa = upiId;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "Event Booking",
        description: `Tickets for ${item.title}`,
        order_id: orderId,
        handler: async function (response: any) {
          console.log("Payment successful:", response);
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-clerk-user-id": user?.id || "",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyResponse.json();
            if (verifyData.status === "success") {
              const bookingDetails = {
                itemTitle: item.title,
                date: item.date,
                venue: item.venue,
                ticketCount,
                totalPrice: parseFloat(totalPrice),
                paymentId: response.razorpay_payment_id,
                createdAt: new Date().toISOString(),
              };
              localStorage.setItem("latestBooking", JSON.stringify(bookingDetails));

              const emailResponse = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to: user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "",
                  itemTitle: item.title,
                  date: item.date,
                  venue: item.venue,
                  ticketCount,
                  totalPrice: parseFloat(totalPrice),
                  paymentId: response.razorpay_payment_id,
                }),
              });

              if (!emailResponse.ok) {
                console.error("Failed to send email:", await emailResponse.json());
              } else {
                console.log("Confirmation email sent to:", user?.primaryEmailAddress?.emailAddress);
              }

              setPaymentSuccess(true);
              setTimeout(() => {
                onClose();
                router.push("/confirmation");
              }, 2000);
            } else {
              setErrorMessage(verifyData.error || "Payment verification failed");
              setIsProcessing(false);
            }
          } catch (error: any) {
            console.error("Payment verification error:", error);
            setErrorMessage(error.message || "Payment verification failed");
            setIsProcessing(false);
          }
        },
        prefill: prefillData,
        theme: { color: "#F97316" },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
        method: {
          upi: true,
          card: true,
          netbanking: false,
          wallet: false,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi",
                    flows: isTestMode ? ["vpa"] : ["vpa", "intent", "qr"],
                  },
                ],
              },
              card: {
                name: "Pay with Card",
                instruments: [
                  {
                    method: "card",
                  },
                ],
              },
            },
            sequence: ["block.upi", "block.card"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
      };

      console.log("Razorpay Options:", JSON.stringify(options, null, 2));

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        setErrorMessage(response.error.description || "Payment failed");
        setIsProcessing(false);
      });
      paymentObject.on("payment.intent", function (data: any) {
        console.log("UPI Intent triggered:", data);
      });
      paymentObject.on("payment.qrCode", function (data: any) {
        console.log("QR Code generated:", data);
      });
      paymentObject.on("payment.submit", function (data: any) {
        console.log("Payment submitted with UPI ID:", data);
      });
      paymentObject.on("payment.error", function (data: any) {
        console.error("Payment error:", data);
        setErrorMessage(data.error.description || "An error occurred during payment.");
        setIsProcessing(false);
      });
      paymentObject.open();
    } catch (error: any) {
      console.error("Payment error:", error.message);
      setErrorMessage(error.message || "An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={item.image || "/placeholder-sport.jpg"}
              alt={item.title}
              className="w-20 h-28 object-cover rounded-md shadow-md"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <CalendarIcon className="h-4 w-4 mr-1 text-orange-600" />
                {item.date
                  ? new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : "TBD"}
              </p>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPinIcon className="h-4 w-4 mr-1 text-orange-600" />
                {item.venue || "TBD"}
              </p>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <UsersIcon className="h-4 w-4 mr-1 text-orange-600" />
                {ticketCount} Ticket{ticketCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total Price:</span>
            <span className="text-xl font-bold text-orange-600">₹{totalPrice}</span>
          </div>
        </div>

        {!paymentSuccess ? (
          <div className="space-y-6">
            <div className="relative">
              <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID (Optional - Will be pre-filled in payment screen)
              </label>
              <input
                id="upiId"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="Enter your UPI ID (e.g., name@upi)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can also enter or change your UPI ID directly in the payment screen.
              </p>
            </div>

            <p className="text-gray-600 text-sm">
              {isTestMode
                ? "Pay via UPI (manual entry only in test mode)."
                : "Pay via UPI (manual entry, Google Pay, PhonePe, Paytm, etc.) or Card."}
            </p>
            {isTestMode && (
              <p className="text-sm text-yellow-600">
                Note: QR code and intent flows are not supported in test mode. Please use manual UPI entry (e.g., success@razorpay).
              </p>
            )}
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-3 rounded-lg font-semibold text-white uppercase ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Payment Successful!</h3>
            <p className="text-gray-600 mt-2">
              Your tickets for {item.title} have been booked.
            </p>
            <Button
              onClick={() => router.push("/confirmation")}
              className="mt-4 bg-orange-600 text-white hover:bg-orange-700 rounded-lg px-6 py-2"
            >
              View Confirmation
            </Button>
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500 text-center">
          Tickets are non-refundable once booked.
        </p>
      </div>
    </div>
  );
};

export default Checkout;