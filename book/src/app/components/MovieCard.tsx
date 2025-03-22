"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";


const MovieCard = ({ movie }) => (
  <Link href={`/movies/${movie._id}`}>
    <div className="flex-shrink-0 w-64 mx-2 bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer">
      <div className="relative h-80">
        {movie.image ? (
          <Image
            src={movie.image}
            alt={movie.title}
            layout="fill"
            objectFit="cover"
            className="transition-opacity duration-300 hover:opacity-90"
            onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
          <h3 className="text-lg font-semibold text-white truncate">{movie.title}</h3>
        </div>
      </div>
    </div>
  </Link>
);


export default function MovieCarousel() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const response = await axios.get("/api/movies");
        setMovies(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const scrollToIndex = (index) => {
    setCurrentIndex(index);
    if (carouselRef.current) {
      const cardWidth = 288; 
      carouselRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? movies.length - 1 : currentIndex - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % movies.length;
    scrollToIndex(newIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">No movies available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <section className="mb-12 text-center">
          <h2 className="text-5xl font-bold text-gray-900 tracking-tight animate-fade-in">
            Featured Movies
          </h2>
          <p className="mt-2 text-lg text-gray-600 animate-fade-in-delay">
            Catch the latest blockbusters in style
          </p>
        </section>

      
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide py-6"
            style={{ scrollBehavior: "smooth" }}
          >
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-6 space-x-2">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index ? "bg-indigo-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

  
      <footer className="bg-gray-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p className="text-sm">© 2025 MovieVerse. All rights reserved.</p>
        </div>
      </footer>

     
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out forwards 0.2s;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}