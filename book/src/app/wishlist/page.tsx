"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import useWishlistStore from "@/lib/wishlistStore";
// Fix the button import path to match your actual project structure
// For example:
// import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
  
  console.log("Wishlist state:", wishlist); // Debugging
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Your Wishlist
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Here are the items you've saved for later.
          </p>
        </section>
        
        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Your wishlist is empty.</p>
            <Link href="/">
              <button
                className="mt-4 text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-all font-medium px-6 py-2 rounded-lg"
              >
                Browse Events
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="relative h-48">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-opacity duration-300 hover:opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.type}</p>
                  <button
                    className="mt-4 w-full text-red-600 border border-red-600 hover:bg-red-50 transition-all font-medium px-4 py-2 rounded-lg"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {wishlist.length > 0 && (
          <div className="mt-8 text-center">
            <button
              className="text-red-600 border border-red-600 hover:bg-red-50 transition-all font-medium px-6 py-2 rounded-lg"
              onClick={clearWishlist}
            >
              Clear Wishlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}