import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Customer from "@/models/Customer";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q) return NextResponse.json({ products: [], customers: [] });

    const [products, customers] = await Promise.all([
      Product.find({
        userId: session.user.id,
        $or: [
          { name: { $regex: q, $options: "i" } },
          { sku: { $regex: q, $options: "i" } },
          { shelfNo: { $regex: q, $options: "i" } },
        ]
      }).limit(5).select("name sku shelfNo stock"),
      Customer.find({
        userId: session.user.id,
        $or: [
          { name: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
        ]
      }).limit(5).select("name phone email totalDue"),
    ]);

    return NextResponse.json({ products, customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
