"use client";
import {useEffect, useState, } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import {
  StarIcon,
  ClockIcon,
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
import useWishlistStore from "@/lib/wishlistStore";
import Checkout from "../../components/Checkout";

type Movie = {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  image: string;
  director: string;
  genre: string;
  duration: number;
};

const MoviePage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);

  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { redirectToSignIn } = useClerk();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const isBookmarked = movie ? wishlist.some((item) => item.id === movie._id) : false;

  useEffect(() => {
    if (authLoaded && userLoaded && isSignedIn && searchParams.get("bookNow") === "true") {
      setShowCheckout(true);
    }
  }, [authLoaded, userLoaded, isSignedIn, searchParams]);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) {
        setError("No movie ID provided in the URL");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/movies/${id}`, {
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
          throw new Error("No movie data returned from server");
        }

        setMovie(data);
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        setError(err.message || "Failed to load movie details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleTicketChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(movie?.availableSeats || 1, ticketCount + delta));
    setTicketCount(newCount);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: movie?.title,
          text: `Check out this movie: ${movie?.title} at ${movie?.venue}!`,
          url: window.location.href,
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleBookmark = () => {
    if (!movie) return;

    if (isBookmarked) {
      removeFromWishlist(movie._id);
    } else {
      addToWishlist({
        id: movie._id,
        title: movie.title,
        type: "Movie",
        image: movie.image,
      });
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
              ? "The requested movie could not be found."
              : error.includes("status: 500")
              ? "There was a server error. Please try again later."
              : "Something went wrong. Please try again later or contact support."}
          </p>
          <Link href="/movies" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
            Return to Movies
          </Link>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700">
        <ShieldCheckIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold">Movie Not Found</h2>
        <p className="text-gray-500 mt-2">The movie you’re looking for doesn’t exist or has been removed.</p>
        <Link href="/movies" className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          Browse Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-900 font-sans">
     
      <div className="bg-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50 to-white opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center">
            {/* Poster */}
            <div className="w-40 md:w-56 flex-shrink-0 mb-6 relative">
              <img
                src={movie.image || "/placeholder-movie.jpg"}
                alt={`${movie.title} poster`}
                className="w-full h-auto rounded-xl shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-300"
                onError={(e) => (e.currentTarget.src = "/placeholder-movie.jpg")}
              />
            </div>
            <div className="pt-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{movie.title}</h1>
              <p className="text-xl text-gray-600 mt-2">{movie.director || "Director TBD"}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  {movie.genre || "Not specified"}
                </span>
                {movie.availableSeats < 10 && (
                  <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    Limited Seats!
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-gray-600">
                <span className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-orange-600" />
                  {movie.date
                    ? new Date(movie.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "TBD"}
                </span>
                <span className="flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-orange-600" />
                  {movie.venue || "TBD"}
                </span>
                <span className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-400" />
                  Starting at ₹{movie.price.toFixed(2)}
                </span>
                <span className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-orange-600" />
                  {movie.duration} min
                </span>
              </div>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={handleBookmark}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1">
         
            <div className="bg-white rounded-xl p-4 shadow-md flex flex-wrap gap-4 items-center">
              <span className="flex items-center text-gray-700">
                <UsersIcon className="h-5 w-5 mr-2 text-orange-600" />
                {movie.availableSeats} / {movie.totalSeats} Seats Left
              </span>
              <span className="flex items-center text-gray-700">
                <StarIcon className="h-5 w-5 mr-2 text-yellow-400" />
                4.5 (2K+ Booked)
              </span>
            </div>

           
            <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">About the Movie</h2>
              <p className="text-gray-600 leading-relaxed">
                {movie.description || "No description available for this movie."}
              </p>
            </div>

          
            <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Movie Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Director</h3>
                  <p className="mt-1 text-gray-800 font-medium">{movie.director || "TBD"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Genre</h3>
                  <p className="mt-1 text-gray-800 font-medium">{movie.genre || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Venue</h3>
                  <p className="mt-1 text-gray-800 font-medium flex items-center">
                    <MapPinIcon className="h-4 w-4 text-orange-600 mr-1" />
                    {movie.venue || "TBD"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Showing Date</h3>
                  <p className="mt-1 text-gray-800 font-medium">
                    {movie.date
                      ? new Date(movie.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "TBD"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Duration</h3>
                  <p className="mt-1 text-gray-800 font-medium">{movie.duration} minutes</p>
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
                  {movie.availableSeats} Seats Left
                </span>
                <span className="text-sm text-gray-500">of {movie.totalSeats}</span>
              </div>
              <div className="mb-4 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${(movie.availableSeats / movie.totalSeats) * 100}%` }}
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
                      max={movie.availableSeats}
                      value={ticketCount}
                      onChange={(e) =>
                        setTicketCount(Math.min(movie.availableSeats, Math.max(1, parseInt(e.target.value) || 1)))
                      }
                      className="w-16 h-10 text-center border-x-0 focus:outline-none"
                    />
                    <button
                      onClick={() => handleTicketChange(1)}
                      disabled={ticketCount >= movie.availableSeats}
                      className="w-10 h-10 bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total Price</h3>
                  <p className="text-xl font-bold text-gray-800">₹{(movie.price * ticketCount).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">({ticketCount} × ₹{movie.price.toFixed(2)})</p>
                </div>
              </div>
              <button
                onClick={handleBookNow}
                disabled={movie.availableSeats === 0 || !authLoaded || !userLoaded}
                className={`mt-6 w-full py-3 rounded-lg font-semibold text-white shadow-md transition-all transform hover:scale-105 ${
                  movie.availableSeats === 0 || !authLoaded || !userLoaded
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

      {/* Checkout Modal */}
      {showCheckout && isSignedIn && (
        <Checkout
          item={movie}
          ticketCount={ticketCount}
          onClose={() => setShowCheckout(false)}
          user={user}
          itemType="movie"
        />
      )}
    </div>
  );
};

export default MoviePage;
