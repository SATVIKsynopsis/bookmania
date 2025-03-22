"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";

export default function SportsList() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSportType, setSelectedSportType] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [sortByPrice, setSortByPrice] = useState(null); // null, "asc", "desc"

  useEffect(() => {
    async function fetchSports() {
      try {
        setLoading(true);
        const response = await axios.get("/api/sports");
        setSports(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching sports data:", error);
        setError("Failed to load sports events. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchSports();
  }, []);

  // Extract unique sport types for filter
  const sportTypes = ["All", ...new Set(sports.map((sport) => sport.sportType || "Unknown"))];

  // Filter and sort sports
  const filteredSports = sports
    .filter((sport) => {
      const matchesSearch = sport.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSportType =
        selectedSportType === "All" || sport.sportType === selectedSportType;
      const matchesAvailability =
        availabilityFilter === "All" ||
        (availabilityFilter === "Available" && sport.availableSeats > 0) ||
        (availabilityFilter === "Sold Out" && sport.availableSeats === 0);
      return matchesSearch && matchesSportType && matchesAvailability;
    })
    .sort((a, b) => {
      if (sortByPrice === "asc") return (a.price || 0) - (b.price || 0);
      if (sortByPrice === "desc") return (b.price || 0) - (a.price || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sports events...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">BookMania</h1>
          <div className="flex items-center space-x-8">
            <input
              type="text"
              placeholder="Search sports events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700 placeholder-gray-500"
            />
            <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Events
            </a>
            <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              About
            </a>
            
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <section className="mb-12 text-center">
          <h2 className="text-5xl font-bold text-gray-900 tracking-tight">Upcoming Sports Events</h2>
          <p className="mt-2 text-lg text-gray-600">Experience the thrill of live sports action</p>
        </section>

        {/* Filters */}
        <div className="mb-10 flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {/* Sport Type Filter */}
            {sportTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSportType(type)}
                className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedSportType === type
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {/* Availability Filter */}
            {["All", "Available", "Sold Out"].map((option) => (
              <button
                key={option}
                onClick={() => setAvailabilityFilter(option)}
                className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                  availabilityFilter === option
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
            {/* Sort by Price */}
            <button
              onClick={() =>
                setSortByPrice(sortByPrice === "asc" ? "desc" : sortByPrice === "desc" ? null : "asc")
              }
              className="px-5 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Sort by Price {sortByPrice === "asc" ? "↑" : sortByPrice === "desc" ? "↓" : ""}
            </button>
          </div>
        </div>

        {/* Sports Grid */}
        {filteredSports.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No sports events match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSports.map((sport) => (
              <Card
                key={sport.id || sport.title}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="p-0">
                  {sport.image ? (
                    <Image
                      src={sport.image}
                      alt={`${sport.title} event`}
                      width={300}
                      height={200}
                      className="w-full h-72 object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                    />
                  ) : (
                    <div className="w-full h-72 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{sport.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {sport.description || "No description available."}
                  </p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-800">Date:</span>{" "}
                      {sport.date ? new Date(sport.date).toLocaleDateString() : "TBD"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Venue:</span>{" "}
                      {sport.venue || "TBD"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Teams:</span>{" "}
                      {sport.teams?.length ? sport.teams.join(" vs ") : "TBD"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Sport:</span>{" "}
                      {sport.sportType || "Unknown"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Seats:</span>{" "}
                      {sport.availableSeats ?? 0}/{sport.totalSeats ?? "N/A"}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-indigo-600 font-bold text-lg">
                      ${sport.price !== undefined ? sport.price.toFixed(2) : "N/A"}
                    </span>
                    <Link href={`/sports/${sport._id}`}>
                      <Button
                        className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                          sport.availableSeats === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                        disabled={sport.availableSeats === 0}
                      >
                        {sport.availableSeats === 0 ? "Sold Out" : "Book Now"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p className="text-sm">© 2025 BookMania. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}