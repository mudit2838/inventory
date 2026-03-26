import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import Sale from "@/models/Sale";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, ShoppingCart, Calendar } from "lucide-react";
import SalesHistoryTable from "@/components/SalesHistoryTable";

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;

  await connectDB();
  
  const customer = await Customer.findOne({ _id: resolvedParams.id, userId: session.user.id });
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-slate-500">
        <h2 className="text-xl font-bold mb-2 text-slate-900">Customer Not Found</h2>
        <Link href="/dashboard/customers" className="text-[#714B67] hover:underline">&larr; Back to Customers</Link>
      </div>
    );
  }

  const sales = await Sale.find({ customer: customer._id, userId: session.user.id }).sort({ createdAt: -1 });

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 md:px-6 py-4 bg-white border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers" className="p-2 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500">Customer Profile & History</p>
          </div>
        </div>
        <Link 
          href={`/dashboard/sell?customerId=${customer._id}`}
          className="flex items-center justify-center gap-2 bg-[#714B67] hover:bg-[#5C3D54] text-white px-4 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm w-full sm:w-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          New Sale
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Customer Details Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EEF7] text-xl font-bold text-[#714B67]">
                  {customer.name.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{customer.name}</h3>
                  <p className="text-xs text-slate-500">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {customer.phone || <span className="italic text-slate-400">No phone</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {customer.email || <span className="italic text-slate-400">No email</span>}
                </div>
              </div>

              <hr className="my-5 border-[#E2E8F0]" />

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lifetime Value</div>
                  <div className="text-xl font-bold text-slate-900">₹{customer.totalPurchases.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Outstanding Due</div>
                  <div className={`text-xl font-bold ${customer.totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₹{customer.totalDue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Orders</div>
                  <div className="text-xl font-bold text-slate-900">{sales.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase History Main Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h3 className="font-semibold text-slate-900 text-base">Purchase History Dashboard</h3>
              </div>
              
              <SalesHistoryTable sales={JSON.parse(JSON.stringify(sales))} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
