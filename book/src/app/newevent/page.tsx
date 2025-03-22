"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function UploadForm() {
    const [category, setCategory] = useState("movies");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        venue: "",
        price: "",
        totalSeats: "",
        availableSeats: "",
        image: "",
        director: "",
        genre: "",
        duration: "",
        team1: "",
        team2: "",
        sportType: "",
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ Handle Image Selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // ✅ Upload Image to Cloudinary & Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";
            
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("upload_preset", "z1ocrd2l");   // Replace with Cloudinary upload preset
                
                const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/dtmx6czik/image/upload", {
                    method: "POST",
                    body: formData,
                });

                const cloudinaryData = await cloudinaryRes.json();
                imageUrl = cloudinaryData.secure_url;
            }

            const endpoint = `/api/${category}`;
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, image: imageUrl }),
            });

            const data = await res.json();
            if (res.ok) {
                alert(`${category} added successfully!`);
                setFormData({
                    title: "",
                    description: "",
                    date: "",
                    venue: "",
                    price: "",
                    totalSeats: "",
                    availableSeats: "",
                    image: "",
                    director: "",
                    genre: "",
                    duration: "",
                    team1: "",
                    team2: "",
                    sportType: "",
                });
                setSelectedFile(null);
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-lg mx-auto mt-10">
            <CardContent className="space-y-4 p-6">
                <h2 className="text-xl font-bold">Add {category.charAt(0).toUpperCase() + category.slice(1)}</h2>

                {/* Category Selection */}
                <Label>Select Category</Label>
                <Select onValueChange={setCategory} defaultValue="movies">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="movies">Movies</SelectItem>
                        <SelectItem value="shows">Shows</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                </Select>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Label>Title</Label>
                    <Input name="title" placeholder="Title" onChange={handleChange} required />

                    <Label>Description</Label>
                    <Textarea name="description" placeholder="Description" onChange={handleChange} required />

                    <Label>Date</Label>
                    <Input name="date" type="date" onChange={handleChange} required />

                    <Label>Venue</Label>
                    <Input name="venue" placeholder="Venue" onChange={handleChange} required />

                    <Label>Price</Label>
                    <Input name="price" type="number" placeholder="Price" onChange={handleChange} required />

                    <Label>Total Seats</Label>
                    <Input name="totalSeats" type="number" placeholder="Total Seats" onChange={handleChange} required />

                    <Label>Available Seats</Label>
                    <Input name="availableSeats" type="number" placeholder="Available Seats" onChange={handleChange} required />

                    {/* Show Movies-Specific Fields */}
                    {category === "movies" && (
                        <>
                            <Label>Director</Label>
                            <Input name="director" placeholder="Director" onChange={handleChange} required />

                            <Label>Genre</Label>
                            <Input name="genre" placeholder="Genre" onChange={handleChange} required />

                            <Label>Duration (minutes)</Label>
                            <Input name="duration" type="number" placeholder="Duration" onChange={handleChange} required />
                        </>
                    )}

                    {/* Show Sports-Specific Fields */}
                    {category === "sports" && (
                        <>
                            <Label>Team 1</Label>
                            <Input name="team1" placeholder="Team 1" onChange={handleChange} required />

                            <Label>Team 2</Label>
                            <Input name="team2" placeholder="Team 2" onChange={handleChange} required />

                            <Label>Sport Type</Label>
                            <Input name="sportType" placeholder="Sport Type (e.g., Football, Cricket)" onChange={handleChange} required />
                        </>
                    )}

                    {/* ✅ Image Upload */}
                    <Label>Image</Label>
                    <Input type="file" accept="image/*" onChange={handleImageChange} />

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-amber-400 cursor-pointer" disabled={loading}>
                        {loading ? "Submitting..." : `Add ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
