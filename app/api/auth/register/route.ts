import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, businessName } = body;

    if (!name || !email || !password || !businessName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      // Drop stale username index if it exists from previous schema versions
      await User.collection.dropIndex("username_1");
    } catch (e) {
      // Ignore if index doesn't exist
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      businessName,
      plan: "free",
      planLimits: {
        maxProducts: 50,
        maxSalesPerMonth: 100,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
