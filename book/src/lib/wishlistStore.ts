import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistItem {
  id: string;
  title: string;
  type: "Movie" | "Show" | "Sport";
  image?: string;
}

interface WishlistState {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      wishlist: [],
      addToWishlist: (item) =>
        set((state) => {
          const exists = state.wishlist.some((wishlistItem) => wishlistItem.id === item.id);
          if (exists) {
            console.log("Item already exists in wishlist:", item);
            return state;
          }
          console.log("Adding to wishlist:", item);
          return { wishlist: [...state.wishlist, item] };
        }),
      removeFromWishlist: (id) =>
        set((state) => {
          console.log("Removing from wishlist:", id);
          return {
            wishlist: state.wishlist.filter((item) => item.id !== id),
          };
        }),
      clearWishlist: () =>
        set(() => {
          console.log("Clearing wishlist");
          return { wishlist: [] };
        }),
    }),
    {
      name: "wishlist-storage",
    }
  )
);

export default useWishlistStore;