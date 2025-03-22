import Sport from "@/app/models/sports.model";
import { connectDB } from "@/lib/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface SportRequestBody {
  title: string;
  description: string;
  date: string;
  venue: string;
  price: number;
  totalSeats: number;
  availableSeats?: number;
  image: string;
  teams: string[];
  sportType: string;
}

interface SportDocument {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  image: string;
  teams: string[];
  sportType: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json() as SportRequestBody;
    const { title, description, date, venue, price, totalSeats, availableSeats, image, teams, sportType } = body;

    if (!title || !description || !date || !venue || !price || !totalSeats || !image) {
      return NextResponse.json({ message: "Please fill all the fields" }, { status: 400 });
    }

    if (
      typeof price !== "number" ||
      typeof totalSeats !== "number" ||
      (availableSeats !== undefined && typeof availableSeats !== "number")
    ) {
      return NextResponse.json(
        { message: "Price, totalSeats, and availableSeats must be numbers" },
        { status: 400 }
      );
    }

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "sports",
    });

    console.log("Cloudinary Upload Successful:", uploadedImage.secure_url);

    const newSport = new Sport({
      title,
      description,
      date,
      venue,
      price,
      totalSeats,
      availableSeats: availableSeats ?? totalSeats,
      image: uploadedImage.secure_url,
      teams,
      sportType,
    });

    await newSport.save();
    return NextResponse.json({ message: "Sport added successfully" }, { status: 201 });
  } catch (error: Error) {
    console.error("Error saving sport:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const sports = await Sport.find({}).exec() as SportDocument[];
    return NextResponse.json(sports, { status: 200 });
  } catch (error: Error) {
    console.error("Error fetching sports:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}