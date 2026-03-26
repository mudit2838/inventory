import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { productSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const statusFilter = searchParams.get("status");

    const query: any = { userId: session.user.id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { shelfNo: { $regex: search, $options: "i" } }
      ];
    }

    if (statusFilter === "low") {
      query.$expr = { $lte: ["$stock", "$minStockLevel"] };
    } else if (statusFilter === "in") {
      query.stock = { $gt: 0 };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    // Enhance with stock status
    const mappedProducts = products.map((p) => {
      const doc = p.toObject();
      return {
        ...doc,
        shelfNo: doc.shelfNo || "", // Ensure it's returned correctly
        stockStatus: doc.stock <= doc.minStockLevel ? "low" : "ok",
      };
    });

    return NextResponse.json({
      products: mappedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    await connectDB();

    // Check Plan Limits
    const userDoc = await User.findById(session.user.id);
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentProductCount = await Product.countDocuments({ userId: session.user.id });
    if (currentProductCount >= userDoc.planLimits.maxProducts) {
      return NextResponse.json(
        { error: `Plan limit reached. You can only create up to ${userDoc.planLimits.maxProducts} products on the ${userDoc.plan} plan.` },
        { status: 403 }
      );
    }

    // Check SKU Uniqueness for Tenant
    const existingSku = await Product.findOne({ userId: session.user.id, sku: validatedData.sku });
    if (existingSku) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
    }

    const newProduct = await Product.create({
      ...validatedData,
      userId: session.user.id,
      businessName: (session.user as any).businessName || "Default Business",
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
