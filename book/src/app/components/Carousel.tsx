"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MovieCarousel() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/movies');
        console.log("Movies data:", response.data);
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    if (movies.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === movies.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [movies]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? movies.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === movies.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) handleNext();
    if (touchStart - touchEnd < -100) handlePrevious();
  };

  const formatImageUrl = (path) => {
    if (!path) return "/api/placeholder/400/320";
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w1280${path}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 bg-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center p-10 bg-white text-gray-800">
        No movies available
      </div>
    );
  }

  const currentMovie = movies[currentIndex];
  const nextIndex = (currentIndex + 1) % movies.length;
  const prevIndex = (currentIndex - 1 + movies.length) % movies.length;

  return (
    <div className="w-full px-4 py-12 bg-white">
      <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-8 tracking-tight animate-fade-in-down">
        Featured Movies
      </h2>

      <div 
        className="relative w-full max-w-6xl mx-auto h-[400px] bg-white overflow-hidden group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
       
        <div className="absolute inset-0 flex transition-all duration-700 ease-out transform-gpu">
      
          <div className="absolute w-full h-full -left-full opacity-30 scale-95 transition-all duration-700 group-hover:opacity-40">
            <img 
              src={formatImageUrl(movies[prevIndex]?.image)} 
              alt={movies[prevIndex]?.title || "Movie"}
              className="w-full h-full object-cover transform transition-transform duration-1000 hover:scale-105"
            />
          </div>

          
          <div className="w-full h-full relative flex animate-slide-in">
            <img 
              src={formatImageUrl(currentMovie?.image)}
              alt={currentMovie?.title || "Movie"}
              className="w-full h-full object-cover transform transition-transform duration-1000 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/85 via-gray-900/30 to-transparent transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 opacity-0 animate-slide-up group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <h3 className="text-2xl font-bold mb-2 tracking-tight">
                  {currentMovie?.title}
                </h3>
                <p className="text-sm text-gray-200 mb-4 line-clamp-2">
                  {currentMovie?.description || currentMovie?.overview}
                </p>
                <div className="flex space-x-4">
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium rounded-sm transform transition-all duration-300 hover:scale-110 hover:shadow-lg">
                    Watch Now
                  </button>
                  <button className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-medium rounded-sm transform transition-all duration-300 hover:scale-110 hover:shadow-lg">
                    Add to List
                  </button>
                </div>
              </div>
            </div>
          </div>

         
          <div className="absolute w-full h-full left-full opacity-30 scale-95 transition-all duration-700 group-hover:opacity-40">
            <img 
              src={formatImageUrl(movies[nextIndex]?.image)} 
              alt={movies[nextIndex]?.title || "Movie"}
              className="w-full h-full object-cover transform transition-transform duration-1000 hover:scale-105"
            />
          </div>
        </div>

      
        <button 
          onClick={handlePrevious}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-gradient-to-r from-gray-800 to-gray-700 text-white p-3 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:from-gray-900 hover:to-gray-800 hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={handleNext}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-gradient-to-r from-gray-800 to-gray-700 text-white p-3 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:from-gray-900 hover:to-gray-800 hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>
      </div>

    
      <div className="flex justify-center mt-6 space-x-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 transform ${
              index === currentIndex 
                ? 'bg-blue-500 scale-150' 
                : 'bg-gray-400 hover:bg-gray-500 hover:scale-125'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}