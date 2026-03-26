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

    // 1. Low Stock Notifications
    const lowStockProducts = await Product.find({
      userId: session.user.id,
      $expr: { $lte: ["$stock", "$minStockLevel"] }
    }).limit(10).select("name stock minStockLevel shelfNo");

    // 2. High Due Notifications (Customers with more than 10k due)
    const highDueCustomers = await Customer.find({
      userId: session.user.id,
      totalDue: { $gt: 10000 }
    }).limit(5).select("name totalDue");

    // Map to unified notifications
    const notifications = [
      ...lowStockProducts.map(p => ({
        id: `low-stock-${p._id}`,
        type: "low-stock",
        title: "Low Stock Alert",
        message: `${p.name} is low on stock (${p.stock} units left). Location: ${p.shelfNo || "Unset"}`,
        link: "/dashboard/products",
        createdAt: new Date(),
      })),
      ...highDueCustomers.map(c => ({
        id: `high-due-${c._id}`,
        type: "high-due",
        title: "High Credit Outstanding",
        message: `${c.name} has a pending balance of ₹${c.totalDue.toLocaleString()}.`,
        link: "/dashboard/credit",
        createdAt: new Date(),
      }))
    ];

    // Sort by type or priority (Low stock first here)
    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
