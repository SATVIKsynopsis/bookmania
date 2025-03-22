"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

type BookingDetails = {
  itemTitle: string;
  date: string;
  venue: string;
  ticketCount: number;
  totalPrice: number;
  paymentId: string;
  createdAt: string;
};

const ConfirmationPage = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  useEffect(() => {
    const details = localStorage.getItem("latestBooking");
    if (details) {
      setBookingDetails(JSON.parse(details));
    }
  }, []);

  if (!bookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700">
        <h2 className="text-2xl font-semibold">No Booking Found</h2>
        <p className="text-gray-500 mt-2">It looks like you haven’t made a booking yet.</p>
        <div className="mt-6 flex gap-4">
          <Link
            href="/movies"
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Browse Movies
          </Link>
          <Link
            href="/sports"
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Browse Sports Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-900 font-sans min-h-screen flex items-center justify-center py-12">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your booking. We’ve sent a confirmation email with the details below.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 text-left space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">{bookingDetails.itemTitle}</h2>
            <p className="text-gray-600 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-orange-600" />
              {bookingDetails.date
                ? new Date(bookingDetails.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "TBD"}
            </p>
            <p className="text-gray-600 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-orange-600" />
              {bookingDetails.venue || "TBD"}
            </p>
            <p className="text-gray-600 flex items-center">
              <UsersIcon className="h-5 w-5 mr-2 text-orange-600" />
              {bookingDetails.ticketCount} Ticket{bookingDetails.ticketCount > 1 ? "s" : ""}
            </p>
            <p className="text-gray-600 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-orange-600" />
              Total: ₹{bookingDetails.totalPrice.toFixed(2)}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Payment ID:</span> {bookingDetails.paymentId}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Booked on:</span>{" "}
              {new Date(bookingDetails.createdAt).toLocaleString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/movies"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Browse Movies
            </Link>
            <Link
              href="/sports"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Browse More Events
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Need help? Contact us at{" "}
            <a href="mailto:support@yourapp.com" className="text-orange-600 hover:underline">
              
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;