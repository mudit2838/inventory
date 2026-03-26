import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import CreditTransaction from "@/models/CreditTransaction";
import { saleSchema } from "@/lib/validations";
import { generateSaleNumber } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const userId = session.user.id;

    // Default to last 30 days
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await Sale.find({ userId, createdAt: { $gte: startDate } });

    // Global totals for the tenant (could also be filtered by date, but frontend header usually shows lifetime or period totals)
    // For simplicity with the current dashboard, we'll calculate them from the range-filtered sales
    let totalSales = 0;
    let totalProfit = 0;
    const dailyMap = new Map();

    sales.forEach((sale) => {
      totalSales += sale.totalAmount;
      totalProfit += sale.totalProfit;
      
      const dateStr = new Date(sale.createdAt).toISOString().split('T')[0];
      const existing = dailyMap.get(dateStr) || { _id: dateStr, totalAmount: 0, totalProfit: 0, count: 0 };
      existing.totalAmount += sale.totalAmount;
      existing.totalProfit += sale.totalProfit;
      existing.count += 1;
      dailyMap.set(dateStr, existing);
    });

    const dailySummary = Array.from(dailyMap.values()).sort((a: any, b: any) => a._id.localeCompare(b._id));

    return NextResponse.json({
      stats: { totalSales, totalProfit },
      dailySummary
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validatedData = saleSchema.parse(body);

    await connectDB();
    const userId = session.user.id;
    const businessName = (session.user as any).businessName || "Default";

    // Prepare arrays and totals
    let totalAmount = 0;
    let totalProfit = 0;
    const itemsToSave = [];

    // Atomic Stock Deduction
    for (const item of validatedData.items) {
      // Find product and atomically decrement stock ONLY IF stock >= quantity
      const product = await Product.findOneAndUpdate(
        { _id: item.product, userId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!product) {
        // Rollback any previous deductions in case of failure
        for (const doneItem of itemsToSave) {
          await Product.updateOne({ _id: doneItem.product }, { $inc: { stock: doneItem.quantity } });
        }
        return NextResponse.json(
          { error: `Insufficient stock or invalid product for ${item.name}` },
          { status: 400 }
        );
      }

      const itemTotal = item.quantity * item.sellingPrice;
      const itemProfit = (item.sellingPrice - item.purchasePrice) * item.quantity;

      totalAmount += itemTotal;
      totalProfit += itemProfit;

      itemsToSave.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        sellingPrice: item.sellingPrice,
      });
    }

    // Create Sale Record
    const sale = await Sale.create({
      userId,
      businessName,
      saleNumber: generateSaleNumber(),
      items: itemsToSave,
      totalAmount,
      totalProfit,
      paymentType: validatedData.paymentType,
      customer: validatedData.customerId || null,
      customerName: validatedData.customerName || null,
      customerPhone: validatedData.customerPhone || null,
      status: 'completed',
    });

    // Handle Customer & Credit Logic
    if (validatedData.customerId) {
      const updatePayload: any = { $inc: { totalPurchases: totalAmount } };
      
      if (validatedData.paymentType === 'credit') {
        updatePayload.$inc.totalDue = totalAmount;
      }
      
      await Customer.findByIdAndUpdate(validatedData.customerId, updatePayload);

      if (validatedData.paymentType === 'credit') {
        await CreditTransaction.create({
          userId,
          businessName,
          customer: validatedData.customerId,
          sale: sale._id,
          amount: totalAmount,
          type: 'charge',
          notes: `Sale #${sale.saleNumber}`
        });
      }
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
