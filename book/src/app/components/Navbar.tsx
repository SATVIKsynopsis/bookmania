"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@heroui/button";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

// List of major Indian cities
const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune",
  "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",
  "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar",
  "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai",
  "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada",
  "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Bhubaneswar",
];

export default function SearchAndNav() {
  const [selectedCity, setSelectedCity] = useState("Bhubaneswar");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useAuth(); // Clerk hook to check auth status

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      {/* Search Bar */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="data:image/png;base64,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" // Replace with your logo path
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
              BookMania
            </span>
          </Link>
        </div>

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

        <div className="flex items-center space-x-6">
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

          {/* Clerk Authentication with Wishlist */}
          {isSignedIn ? (
            <div className="flex items-center space-x-4">
              <Link href="/wishlist">
                <Button
                  variant="outline"
                  className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 transition-all font-medium px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>Wishlist</span>
                </Button>
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-full shadow-md",
                  },
                }}
              />
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-4">
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 transition-all font-medium px-4 py-2 rounded-lg"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  color="primary"
                  variant="flat"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-medium px-4 py-2 rounded-lg shadow-md"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
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
      </nav>

      {/* Navigation Links */}
      <Navbar className="max-w-7xl mx-auto px-6 py-3 bg-white border-t border-gray-200">
        <NavbarContent className="hidden md:flex space-x-8 justify-center">
          <NavbarItem>
            <Link
              href="/movies"
              className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
            >
              Movies
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              href="/shows"
              className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
            >
              Shows
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              href="/sports"
              className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
            >
              Sports
            </Link>
          </NavbarItem>
        </NavbarContent>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-[100%] left-0 right-0 bg-white shadow-lg border-t border-gray-200">
            <div className="flex flex-col items-center py-4 space-y-4">
              <Link
                href="/movies"
                className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Movies
              </Link>
              <Link
                href="/shows"
                className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shows
              </Link>
              <Link
                href="/sports"
                className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sports
              </Link>
              {isSignedIn ? (
                <Link
                  href="/wishlist"
                  className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Wishlist
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      className="w-32 text-indigo-600 border-indigo-600 hover:bg-indigo-50 transition-all font-medium px-4 py-2 rounded-lg"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button
                      color="primary"
                      variant="flat"
                      className="w-32 bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-medium px-4 py-2 rounded-lg shadow-md"
                    >
                      Sign Up
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        )}
      </Navbar>
    </header>
  );
}