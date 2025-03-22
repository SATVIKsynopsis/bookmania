"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";

interface Movie {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  image: string;
  director?: string;
  genre?: string;
  duration?: number;
}

interface Sport {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  image: string;
  teams?: string[];
  sportType?: string;
}

interface User {
  id: string;
  fullName?: string;
  primaryEmailAddress?: { emailAddress: string };
  emailAddresses?: Array<{ emailAddress: string }>;
  phoneNumbers?: Array<{ phoneNumber: string }>;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

interface CheckoutProps {
  item: Movie | Sport;
  ticketCount: number;
  onClose: () => void;
  user: User;
  itemType: "movie" | "sport";
}

const Checkout = ({ item, ticketCount, onClose, user, itemType }: CheckoutProps) => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalPrice = (item.price * ticketCount).toFixed(2);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => console.log("Razorpay SDK loaded");
      script.onerror = () => console.error("Failed to load Razorpay SDK");
    }
  }, []);

  const handleUPIPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": user?.id || "",
        },
        body: JSON.stringify({
          amount: parseFloat(totalPrice) * 100, // Convert to paise
          itemId: item._id,
          itemType,
          ticketCount,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to create Razorpay order (Status: ${response.status})`);
        } else {
          const text = await response.text();
          throw new Error(`Unexpected response from server: ${text.slice(0, 100)}... (Status: ${response.status})`);
        }
      }

      const { orderId, amount, currency } = await response.json();

      const prefillData = {
        name: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        contact: user?.phoneNumbers?.[0]?.phoneNumber || "",
      };

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "Movie Booking",
        description: `Tickets for ${item.title}`,
        order_id: orderId,
        handler: async function (response: RazorpayResponse) {
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
              setPaymentSuccess(true);
              setTimeout(() => {
                onClose();
                router.push("/confirmation");
              }, 2000);
            } else {
              setErrorMessage("Payment verification failed");
              setIsProcessing(false);
            }
          } catch (error: Error) {
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
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response: RazorpayErrorResponse) {
        console.error("UPI payment failed:", response.error);
        setErrorMessage(response.error.description || "UPI Payment failed");
        setIsProcessing(false);
      });
      paymentObject.open();
    } catch (error: Error) {
      console.error("UPI payment error:", error.message);
      setErrorMessage(error.message || "An unexpected error occurred with UPI. Please try again.");
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
            <Image
              src={item.image || "/placeholder-movie.jpg"}
              alt={item.title}
              width={80}
              height={112}
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
            <p className="text-gray-600 text-sm">
              Pay via UPI (Google Pay, PhonePe, Paytm, etc.).
            </p>
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            <Button
              onClick={handleUPIPayment}
              disabled={isProcessing}
              className={`w-full py-3 rounded-lg font-semibold text-white uppercase ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isProcessing ? "Processing..." : "Pay with UPI"}
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