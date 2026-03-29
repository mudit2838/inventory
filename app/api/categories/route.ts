import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Get unique categories for this user from their products
    const categories = await Product.distinct("category", { userId: session.user.id });
    
    // Always include 'General' if not present
    if (!categories.includes("General")) {
      categories.push("General");
    }

    return NextResponse.json({ categories: categories.sort() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
