import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import CreditTransaction from "@/models/CreditTransaction";
import Customer from "@/models/Customer";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const transactions = await CreditTransaction.find({ userId: session.user.id })
      .populate('customer', 'name phone')
      .populate('sale') // Populate entire sale object for detailed modal
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { customerId, amount, notes } = body;

    if (!customerId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
    }

    await connectDB();

    const customer = await Customer.findOne({ _id: customerId, userId: session.user.id });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    // Ensure we do not overpay the due amount
    const actualPayment = Math.min(amount, customer.totalDue);
    if (actualPayment <= 0) return NextResponse.json({ error: "Customer has no due" }, { status: 400 });

    const payment = await CreditTransaction.create({
      userId: session.user.id,
      businessName: (session.user as any).businessName || "Default",
      customer: customerId,
      amount: actualPayment,
      type: 'payment',
      notes: notes || 'Manual Payment Received'
    });

    await Customer.findByIdAndUpdate(customerId, { $inc: { totalDue: -actualPayment } });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
