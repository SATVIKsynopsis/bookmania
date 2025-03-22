
import Sport from "@/app/models/sports.model";
import { connectDB } from "@/lib/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      await connectDB();
      const sport = Sport.findById(params.id);
      const sportData = await sport.exec();
      return NextResponse.json(sportData, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  }