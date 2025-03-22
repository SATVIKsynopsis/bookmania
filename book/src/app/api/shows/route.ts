import Show from "@/app/models/shows.model";
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
        const {title,description,date,venue,price,totalSeats,availableSeats, image, performers, duration } = await request.json();
        
    if (!title || !description || !date || !venue || !price || !totalSeats) {
        return NextResponse.json({ message: "Please fill all the fields" }, {status: 400});
    }

    const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: "movies",
    });

    console.log("Cloudinary Upload Successful:", uploadedImage.secure_url);



    const newshow = new Show({
        title,
        description,
        date,
        venue,
        price,
        totalSeats,
        availableSeats,
        image: uploadedImage.secure_url,
        performers,
        duration
    });

    await newshow.save();
    return NextResponse.json({ message: "Show added successfully" });
        

    } catch (error:any) {
        NextResponse.json({ message: error.message });
        
    }
}
