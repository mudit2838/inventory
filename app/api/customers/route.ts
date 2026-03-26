import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { customerSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const query: any = { userId: session.user.id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validatedData = customerSchema.parse(body);

    await connectDB();

    // Ensure phone uniqueness if provided
    if (validatedData.phone) {
      const existing = await Customer.findOne({ userId: session.user.id, phone: validatedData.phone });
      if (existing) return NextResponse.json({ error: "Phone number already exists" }, { status: 400 });
    }

    const newCustomer = await Customer.create({
      ...validatedData,
      userId: session.user.id,
      businessName: (session.user as any).businessName || "Default",
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
