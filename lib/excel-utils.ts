/**
 * Utility functions for exporting data to CSV (compatible with Excel)
 */

export function exportToCsv(filename: string, rows: string[][]) {
  const processRow = (row: string[]) => {
    return row.map(cell => {
      const stringCell = cell === null || cell === undefined ? '' : String(cell);
      // Escape quotes and wrap in quotes if contains comma or quote
      const escaped = stringCell.replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
        return `"${escaped}"`;
      }
      return escaped;
    }).join(',');
  };

  const csvContent = rows.map(processRow).join('\r\n');
  
  // Add matching UTF-8 BOM so Excel opens it correctly with UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportInvoiceToCsv(sale: any) {
  const filename = `Invoice_${sale.saleNumber}.csv`;
  const rows = [
    ['INVOICE', sale.saleNumber],
    ['Date', new Date(sale.createdAt).toLocaleDateString()],
    ['Time', new Date(sale.createdAt).toLocaleTimeString()],
    ['Customer', sale.customer?.name || sale.customerName || 'Walk-in Customer'],
    ['Phone', sale.customer?.phone || sale.customerPhone || 'N/A'],
    ['Payment Type', sale.paymentType],
    [],
    ['Item Name', 'Quantity', 'Price (INR)', 'Total (INR)'],
  ];

  sale.items.forEach((item: any) => {
    rows.push([
      item.name,
      item.quantity.toString(),
      item.sellingPrice.toFixed(2),
      (item.quantity * item.sellingPrice).toFixed(2)
    ]);
  });

  rows.push([]);
  rows.push(['', '', 'Grand Total', sale.totalAmount.toFixed(2)]);

  exportToCsv(filename, rows);
}

export function exportHistoryToCsv(sales: any[]) {
  const filename = `Sales_History_${new Date().toISOString().split('T')[0]}.csv`;
  const rows = [
    ['Date', 'Invoice #', 'Customer', 'Items Count', 'Payment Type', 'Total Amount (INR)']
  ];

  sales.forEach((s: any) => {
    rows.push([
      new Date(s.createdAt).toLocaleDateString(),
      s.saleNumber,
      s.customer?.name || s.customerName || 'Walk-in',
      s.items.length.toString(),
      s.paymentType,
      s.totalAmount.toFixed(2)
    ]);
  });

  exportToCsv(filename, rows);
}
