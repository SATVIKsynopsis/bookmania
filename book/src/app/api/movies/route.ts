import Movie from "@/app/models/movies.model";
import { connectDB } from "@/lib/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name: "dtmx6czik",
    api_key: "836922143189834",
    api_secret: "1K2ATNibfcxTnyA0HS_AbPgTMRg",
});

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const { title, description, date, venue, price, totalSeats, availableSeats, image, director, genre, duration } = body;

        if (!title || !description || !date || !venue || !price || !totalSeats || !image) {
            return NextResponse.json({ message: "Please fill all the fields" }, { status: 400 });
        }

        
        const uploadedImage = await cloudinary.uploader.upload(image, {
            folder: "movies",
        });

        console.log("Cloudinary Upload Successful:", uploadedImage.secure_url);

        
        const newMovie = new Movie({
            title,
            description,
            date,
            venue,
            price,
            totalSeats,
            availableSeats,
            image: uploadedImage.secure_url,
            director,
            genre,
            duration
        });

        await newMovie.save();
        return NextResponse.json({ message: "Movie added successfully" }, { status: 201 });

    } catch (error: any) {
        console.error("Error saving movie:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}


export async function GET(request: NextRequest) {
    try {
       
        await connectDB();
        
        
        const movies = await Movie.find({}).exec();
        
        
        return NextResponse.json(movies, { status: 200 });
    } catch (error) {
        
        console.error("Error fetching movies:", error);
        
        
        return NextResponse.json(
            { 
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error"
            }, 
            { status: 500 }
        );
    }
}