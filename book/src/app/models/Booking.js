import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true, 
  },
  movieId: {
    type: String,
    required: true,
  },
  movieTitle: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  ticketCount: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String,
    required: true, 
  },
  orderId: {
    type: String,
    required: true, 
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "refunded"],
    default: "confirmed",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);