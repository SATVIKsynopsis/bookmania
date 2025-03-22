import mongoose from 'mongoose';

const SportSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String},
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    price: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    image: { type: String },
    teams: { type: [String], required: true },
    sportType: { type: String, required: true }, // Example: Football, Cricket
  }, { timestamps: true });
  
  export default mongoose.models.Sport || mongoose.model("Sport", SportSchema);