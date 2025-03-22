"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { NextPage } from "next";
import Link from "next/link";
import {
  StarIcon,
  CalendarIcon,
  HeartIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";
import {
  ExclamationCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import Checkout from "../../components/Checkout";

type SportEvent = {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  image: string;
  teams: string[];
  sportType: string;
};

const SportEventPage: NextPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);

  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { redirectToSignIn } = useClerk();

  // Auto-open checkout modal if returning from sign-in with 'bookNow=true'
  useEffect(() => {
    if (authLoaded && userLoaded && isSignedIn && searchParams.get("bookNow") === "true") {
      setShowCheckout(true);
    }
  }, [authLoaded, userLoaded, isSignedIn, searchParams]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("No event ID provided in the URL");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/sports/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || `Server responded with status: ${res.status}`;
          throw new Error(errorMessage);
        }

        const data = await res.json();
        if (!data || Object.keys(data).length === 0) {
          throw new Error("No event data returned from server");
        }

        setEvent(data);
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        setError(err.message || "Failed to load event details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleTicketChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(event?.availableSeats || 1, ticketCount + delta));
    setTicketCount(newCount);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: `Check out this event: ${event?.title} at ${event?.venue}!`,
          url: window.location.href,
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleBookNow = () => {
    if (!authLoaded || !userLoaded) {
      return;
    }

    if (!isSignedIn) {
      redirectToSignIn({
        returnBackUrl: `${window.location.href}?bookNow=true`,
      });
      return;
    }

    setShowCheckout(true);
  };

  if (!authLoaded || !userLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="bg-gray-200 rounded-lg h-96 w-full md:w-80"></div>
          <div className="flex-1 space-y-6">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-lg font-medium text-red-800">Error: {error}</p>
          </div>
          <p className="mt-2 text-red-600">
            {error.includes("status: 404")
              ? "The requested event could not be found."
              : error.includes("status: 500")
              ? "There was a server error. Please try again later."
              : "Something went wrong. Please try again later or contact support."}
          </p>
          <Link href="/sports" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
            Return to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700">
        <ShieldCheckIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold">Event Not Found</h2>
        <p className="text-gray-500 mt-2">The event you’re looking for doesn’t exist or has been removed.</p>
        <Link href="/sports" className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          Browse Events
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-900 font-sans">
      {/* Hero Section */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Poster (Centered) */}
            <div className="w-40 md:w-56 flex-shrink-0 mb-6">
              <img
                src={event.image || "/placeholder-sport.jpg"}
                alt={`${event.title} image`}
                className="w-full h-auto rounded-xl shadow-xl border-4 border-white"
                onError={(e) => (e.currentTarget.src = "/placeholder-sport.jpg")}
              />
            </div>
            {/* Event Info */}
            <div className="pt-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{event.title}</h1>
              <p className="text-xl text-gray-600 mt-2">{event.teams.join(" vs ") || "TBD"}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  {event.sportType || "Not specified"}
                </span>
                {event.availableSeats < 100 && (
                  <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    Limited Seats!
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-gray-600">
                <span className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-orange-600" />
                  {event.date
                    ? new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "TBD"}
                </span>
                <span className="flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-orange-600" />
                  {event.venue || "TBD"}
                </span>
                <span className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-400" />
                  Starting at ₹{event.price.toFixed(2)} {/* Changed to ₹ to match Checkout */}
                </span>
              </div>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2 rounded-full shadow-md transition-all transform hover:scale-110 ${
                    isBookmarked
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <HeartIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 shadow-md transition-all transform hover:scale-110"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Event Details */}
          <div className="flex-1">
            {/* Quick Info Bar */}
            <div className="bg-white rounded-xl p-4 shadow-md flex flex-wrap gap-4 items-center">
              <span className="flex items-center text-gray-700">
                <UsersIcon className="h-5 w-5 mr-2 text-orange-600" />
                {event.availableSeats} / {event.totalSeats} Seats Left
              </span>
              <span className="flex items-center text-gray-700">
                <StarIcon className="h-5 w-5 mr-2 text-yellow-400" />
                4.5 (2K+ Booked)
              </span>
            </div>

            {/* About Section */}
            <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">About the Event</h2>
              <p className="text-gray-600 leading-relaxed">
                {event.description || "No description available for this event."}
              </p>
            </div>

            {/* Event Details */}
            <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Teams</h3>
                  <p className="mt-1 text-gray-800 font-medium">{event.teams.join(" vs ") || "TBD"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Sport Type</h3>
                  <p className="mt-1 text-gray-800 font-medium">{event.sportType || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Venue</h3>
                  <p className="mt-1 text-gray-800 font-medium flex items-center">
                    <MapPinIcon className="h-4 w-4 text-orange-600 mr-1" />
                    {event.venue || "TBD"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Event Date</h3>
                  <p className="mt-1 text-gray-800 font-medium">
                    {event.date
                      ? new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "TBD"}
                  </p>
                </div>
              </div>
            </div>
          </div>

       
          <div className="lg:w-96 flex-shrink-0">
            <div className="lg:sticky lg:top-4 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Book Your Tickets</h2>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center text-gray-600">
                  <UsersIcon className="h-5 w-5 mr-2 text-orange-600" />
                  {event.availableSeats} Seats Left
                </span>
                <span className="text-sm text-gray-500">of {event.totalSeats}</span>
              </div>
              <div className="mb-4 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Tickets</h3>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleTicketChange(-1)}
                      disabled={ticketCount <= 1}
                      className="w-10 h-10 bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={event.availableSeats}
                      value={ticketCount}
                      onChange={(e) =>
                        setTicketCount(Math.min(event.availableSeats, Math.max(1, parseInt(e.target.value) || 1)))
                      }
                      className="w-16 h-10 text-center border-x-0 focus:outline-none"
                    />
                    <button
                      onClick={() => handleTicketChange(1)}
                      disabled={ticketCount >= event.availableSeats}
                      className="w-10 h-10 bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total Price</h3>
                  <p className="text-xl font-bold text-gray-800">₹{(event.price * ticketCount).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">({ticketCount} × ₹{event.price.toFixed(2)})</p>
                </div>
              </div>
              <button
                onClick={handleBookNow}
                disabled={event.availableSeats === 0 || !authLoaded || !userLoaded}
                className={`mt-6 w-full py-3 rounded-lg font-semibold text-white shadow-md transition-all transform hover:scale-105 ${
                  event.availableSeats === 0 || !authLoaded || !userLoaded
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {authLoaded && userLoaded ? "Book Now" : "Loading..."}
              </button>
              <p className="mt-3 text-sm text-gray-500 text-center">
                Tickets are non-refundable once booked.
              </p>
            </div>
          </div>
        </div>
      </div>

   
      {showCheckout && isSignedIn && (
  <Checkout
    item={event}
    ticketCount={ticketCount}
    onClose={() => setShowCheckout(false)}
    user={user}
    itemType="sport"
  />
)}
    </div>
  );
};

export default SportEventPage;