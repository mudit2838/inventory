import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { productSchema } from "@/lib/validations";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    
    await connectDB();
    const product = await Product.findOne({ _id: params.id, userId: session.user.id });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const body = await request.json();
    
    await connectDB();
    
    // Partial updates allowed
    const product = await Product.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: { ...body } },
      { new: true, runValidators: true }
    );
    
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    
    await connectDB();
    const product = await Product.findOneAndDelete({ _id: params.id, userId: session.user.id });
    
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
