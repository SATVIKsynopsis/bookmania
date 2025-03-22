"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

// List of major Indian cities
const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", 
  "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", 
  "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", 
  "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", 
  "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", 
  "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", 
  "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Bhubaneswar"
];

const Search = () => {
  const [selectedCity, setSelectedCity] = useState("Bhubaneswar");
  const { isSignedIn } = useAuth(); // Check if user is signed in

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.png" // Replace with your logo path
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
            EventSphere
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 mx-8 max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for Movies, Events, Plays, Sports and Activities"
              className="w-full px-4 py-3 pl-12 text-gray-700 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all shadow-sm hover:shadow-md"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10A7 7 0 1 0 3 10a7 7 0 0 0 14 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* City Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center space-x-2 text-gray-700 font-medium border-gray-300 hover:bg-gray-100 transition-all rounded-lg px-4 py-2"
              >
                <span>{selectedCity}</span>
                <svg
                  className="w-4 h-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto w-48 bg-white shadow-lg rounded-md border border-gray-200">
              {cities.map((city) => (
                <DropdownMenuItem
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className="px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Authentication Buttons */}
          {isSignedIn ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 rounded-full shadow-md",
                },
              }}
            />
          ) : (
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <Button className="px-5 py-2 text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-all font-medium">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  variant="outline"
                  className="px-5 py-2 text-indigo-600 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-medium"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          )}

          {/* Menu Icon */}
          <button className="p-2 rounded-md hover:bg-gray-100 transition-all">
            <svg
              className="w-6 h-6 text-gray-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Search;