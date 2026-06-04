import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Create school during setup (no auth required)
export async function POST(request: Request) {
  try {
    // Check if school already exists
    const existing = await prisma.school.findFirst();
    if (existing) {
      return NextResponse.json(
        { error: "School already exists" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim() || null;
    const motto = String(formData.get("motto") ?? "").trim() || null;

    // Validation
    if (!name || !email || !phone || !address) {
      return NextResponse.json(
        { error: "Name, email, phone, and address are required" },
        { status: 400 }
      );
    }

    // Create school with branding
    const school = await prisma.school.create({
      data: {
        name,
        email,
        phone,
        address,
        website,
        motto,
        isActive: false, // Will be activated later
        branding: {
          create: {},
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      school,
      message: "School created successfully" 
    });
  } catch (error) {
    console.error("Error creating school:", error);
    return NextResponse.json(
      { error: "Failed to create school" },
      { status: 500 }
    );
  }
}
