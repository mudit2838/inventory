import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import Customer from "@/models/Customer";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d"; // today, 7d, 30d

    await connectDB();

    const now = new Date();
    let startDate = new Date();
    
    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7d") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    const dateFilter = { createdAt: { $gte: startDate, $lte: now } };
    const userFilter = { userId: session.user.id };

    // 1. Get all relevant sales
    const sales = await Sale.find({ ...userFilter, ...dateFilter }).populate('customer', 'name');

    // Calculate Totals
    let totalSales = 0;
    let totalProfit = 0;

    // Use a map to aggregate daily sales for the chart
    const dailyMap = new Map();
    // Use a map to aggregate top products
    const productMap = new Map();

    sales.forEach(sale => {
      totalSales += sale.totalAmount;
      
      let saleProfit = 0;
      sale.items.forEach((item: any) => {
        // Calculate profit (assuming we have purchasePrice, fallback to 0 if not)
        const profit = (item.sellingPrice - (item.purchasePrice || 0)) * item.quantity;
        saleProfit += profit;
        totalProfit += profit;

        // Top products tracking
        const existing = productMap.get(item.name) || 0;
        productMap.set(item.name, existing + item.quantity);
      });

      // Chart Data grouping
      const dateStr = new Date(sale.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existingDay = dailyMap.get(dateStr) || { sales: 0, profit: 0 };
      dailyMap.set(dateStr, {
        sales: existingDay.sales + sale.totalAmount,
        profit: existingDay.profit + saleProfit
      });
    });

    // 2. Format Chart Data
    const salesData = Array.from(dailyMap.entries()).map(([name, data]: any) => ({
      name,
      sales: data.sales,
      profit: data.profit
    }));

    // 3. Format Top Products
    const topProducts = Array.from(productMap.entries())
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // 4. Products & Stock Stats
    const productsInStock = await Product.countDocuments({ ...userFilter, stock: { $gt: 0 } });
    const lowStock = await Product.countDocuments({ 
      ...userFilter, 
      $expr: { $lte: ["$stock", "$minStockLevel"] } 
    });

    // 5. Credit Due
    const customers = await Customer.find(userFilter);
    const creditDue = customers.reduce((acc, curr) => acc + (curr.totalDue || 0), 0);

    // 6. Recent Sales (Top 5 regardless of date filter to always show something)
    const recentSales = await Sale.find(userFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name');

    const formattedRecentSales = recentSales.map(s => ({
      id: s.saleNumber,
      customer: s.customer?.name || s.customerName || "Walk-in",
      items: s.items.reduce((acc: number, item: any) => acc + item.quantity, 0),
      amount: s.totalAmount,
      type: s.paymentType,
      time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return NextResponse.json({
      stats: {
        totalSales,
        totalProfit,
        productsInStock,
        lowStock,
        creditDue
      },
      salesData: salesData.length ? salesData : [{ name: "No data", sales: 0, profit: 0 }],
      topProducts: topProducts.length ? topProducts : [{ name: "No products sold", sales: 0 }],
      recentSales: formattedRecentSales
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
