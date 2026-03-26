import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSKU(productName: string): string {
  const prefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD');
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export function generateSaleNumber(): string {
  const prefix = 'INV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 10000).toString(36).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function buildWhatsAppReceipt(saleId: string, customerName: string, items: any[], totalAmount: number): string {
  const date = new Date().toLocaleDateString();
  let text = `*Receipt from StockIQ*\nInvoice: ${saleId}\nDate: ${date}\n\n`;
  if (customerName && customerName !== 'Walk-in') {
    text += `Customer: ${customerName}\n\n`;
  }
  text += `*Items:*\n`;
  items.forEach(item => {
    text += `- ${item.name} x${item.quantity}: ₹${(item.quantity * item.sellingPrice).toFixed(2)}\n`;
  });
  text += `\n*Total: ₹${totalAmount.toFixed(2)}*\n\nThank you for your business!`;
  return text;
}

export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, ''); 
  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
}
