"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get("/api/movies");
        setMovies(response.data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };
    fetchMovies();
  }, []);

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGenre === "All" || movie.genre === selectedGenre)
  );

  const genres = ["All", ...new Set(movies.map((movie) => movie.genre))];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            MovieVerse
          </h1>
          <div className="flex items-center space-x-8">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700 placeholder-gray-500"
            />
            <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Movies
            </a>
            <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              About
            </a>
            <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-all font-medium">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <section className="mb-12 text-center">
          <h2 className="text-5xl font-bold text-gray-900 tracking-tight">Now Showing</h2>
          <p className="mt-2 text-lg text-gray-600">Explore the latest cinematic experiences</p>
        </section>

        {/* Genre Filter */}
        <div className="mb-10 flex flex-wrap gap-3 justify-center">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedGenre === genre
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMovies.map((movie) => (
            <div
              key={movie._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-72 object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{movie.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{movie.description}</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-800">Date:</span> {movie.date}</p>
                  <p><span className="font-medium text-gray-800">Venue:</span> {movie.venue}</p>
                  <p><span className="font-medium text-gray-800">Director:</span> {movie.director}</p>
                  <p><span className="font-medium text-gray-800">Genre:</span> {movie.genre}</p>
                  <p><span className="font-medium text-gray-800">Duration:</span> {movie.duration}</p>
                  <p>
                    <span className="font-medium text-gray-800">Seats:</span>{" "}
                    {movie.availableSeats}/{movie.totalSeats}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-indigo-600 font-bold text-lg">${movie.price}</span>
                  <Link href={`/movies/${movie._id}`}>
                    <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-all font-medium">
                      Book Now
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMovies.length === 0 && movies.length > 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No movies match your search criteria.</p>
          </div>
        )}

        {/* Loading State */}
        {movies.length === 0 && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading movies...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p className="text-sm">&copy; 2025 MovieVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Movies;