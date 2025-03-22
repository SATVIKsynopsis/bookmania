import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    price: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    image: { type: String, required: false },
    director: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: Number, required: true }, 
  }, { timestamps: true });

  export default mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
