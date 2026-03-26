import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Customer from "@/models/Customer";
import SalesHistoryTable from "@/components/SalesHistoryTable";
import { History } from "lucide-react";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  
  // Fetch all sales for this tenant and populate customer explicitly
  const sales = await Sale.find({ userId: session.user.id })
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 });

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC] p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sales History</h1>
          <p className="text-sm text-slate-500">Track and categorize every transaction</p>
        </div>
        <div className="p-3 bg-white border border-[#E2E8F0] shadow-sm rounded-lg flex items-center gap-3 w-fit">
          <History className="w-5 h-5 text-[#714B67]" />
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Sales</div>
            <div className="text-lg font-bold text-slate-900 leading-none mt-0.5">{sales.length}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <SalesHistoryTable sales={JSON.parse(JSON.stringify(sales))} showCustomer={true} />
      </div>
    </div>
  );
}
