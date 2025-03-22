import mongoose from "mongoose";

const ShowSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    price: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    image: String,
    performers: { type: [String], required: true },
    duration: { type: Number, required: true }, // in minutes
  }, { timestamps: true });
  
  const Show = mongoose.models.shows || mongoose.model('Show', ShowSchema);
  export default Show;