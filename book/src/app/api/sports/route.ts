import Sport from "@/app/models/sports.model";
import { connectDB } from "@/lib/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name: "dtmx6czik",
    api_key: "836922143189834",
    api_secret: "1K2ATNibfcxTnyA0HS_AbPgTMRg",
});

export async function POST(request: NextRequest , response: NextResponse) {
    try {
        await connectDB();
        const {title,description,date,venue,price,totalSeats,availableSeats, image, teams, sportType } = await request.json();
        
    if (!title || !description || !date || !venue || !price || !totalSeats) {
        return NextResponse.json({ message: "Please fill all the fields" }, {status: 400});
    }

    const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: "movies",
    });

    console.log("Cloudinary Upload Successful:", uploadedImage.secure_url);

    const newsport = new Sport({
        title,
        description,
        date,
        venue,
        price,
        totalSeats,
        availableSeats,
        image: uploadedImage.secure_url,
        teams, 
        sportType
        
    });

    await newsport.save();
    return NextResponse.json({ message: "Sport added successfully" });
        

    } catch (error:any) {
        NextResponse.json({ message: error.message });
        
    }
}

export async function GET(request: NextRequest) {
    try {
       
        await connectDB();
        
        
        const sports = await Sport.find({}).exec();
        
        
        return NextResponse.json(sports, { status: 200 });
    } catch (error) {
        
        console.error("Error fetching sports:", error);
        
        
        return NextResponse.json(
            { 
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error"
            }, 
            { status: 500 }
        );
    }
}