import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/connectDB";
import Booking from "../../models/Booking";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Fetch the latest booking for the user
    const booking = await Booking.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!booking) {
      return res.status(404).json({ error: "No booking found" });
    }

    return res.status(200).json({ booking });
<<<<<<< HEAD
  } catch (error: Error) { // Fixed: Changed `error: any` to `error: Error`
=======
  } catch (error: Error) { 
>>>>>>> fe8e4d7 (changes1)
    console.error("Error fetching booking:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch booking" });
  }
}
