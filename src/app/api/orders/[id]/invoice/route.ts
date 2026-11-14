import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await dbService.getOrderById(params.id);
    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    const items = order.items || [];
    const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const gstRate = 18;
    const estimatedTax = Math.round((order.totalAmount * (gstRate / (100 + gstRate))));
    const taxableSubtotal = order.totalAmount - estimatedTax;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${order.orderNumber} - Duck Cosmetics Haute Atelier</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1A1A1A;
      background: #FFFFFF;
      padding: 40px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #E8E2EE;
      border-radius: 20px;
      padding: 48px;
      box-shadow: 0 10px 30px rgba(93, 58, 122, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #5D3A7A;
      padding-bottom: 28px;
      margin-bottom: 32px;
    }
    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: #5D3A7A;
      letter-spacing: 0.04em;
    }
    .brand-sub {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #71717A;
      margin-top: 4px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-badge {
      display: inline-block;
      background: #F8F6FA;
      color: #5D3A7A;
      border: 1px solid #E8E2EE;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .invoice-number {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 600;
      color: #1A1A1A;
    }
    .invoice-date {
      font-size: 12px;
      color: #71717A;
      margin-top: 4px;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 36px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #5D3A7A;
      margin-bottom: 8px;
    }
    .party-details {
      font-size: 13px;
      color: #3F3F46;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    th {
      background: #F8F6FA;
      text-align: left;
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #5D3A7A;
      border-bottom: 1px solid #E8E2EE;
    }
    th.text-right, td.text-right {
      text-align: right;
    }
    th.text-center, td.text-center {
      text-align: center;
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid #F4F0F7;
      font-size: 13px;
      color: #1A1A1A;
    }
    .totals-container {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 36px;
    }
    .totals-box {
      width: 280px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #52525B;
    }
    .totals-row.grand-total {
      border-top: 2px solid #5D3A7A;
      padding-top: 12px;
      margin-top: 8px;
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: #5D3A7A;
    }
    .footer {
      border-top: 1px solid #E8E2EE;
      padding-top: 24px;
      text-align: center;
      font-size: 11px;
      color: #71717A;
    }
    .print-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #5D3A7A;
      color: #FFFFFF;
      border: none;
      padding: 12px 24px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(93, 58, 122, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 999;
    }
    .print-button:hover {
      background: #4A2D61;
    }
    @media print {
      body { padding: 0; background: #FFF; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
      .print-button { display: none !important; }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    Save as PDF / Print
  </button>

  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">DUCK COSMETICS</div>
        <div class="brand-sub">Haute Parfumerie & Botanical Skincare Atelier</div>
      </div>
      <div class="invoice-meta">
        <span class="invoice-badge">Tax Invoice</span>
        <div class="invoice-number">${order.orderNumber}</div>
        <div class="invoice-date">${new Date(order.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</div>
      </div>
    </div>

    <div class="parties">
      <div>
        <div class="section-title">Billed & Shipped To:</div>
        <div class="party-details">
          <strong>${order.customerName}</strong><br>
          ${order.address}<br>
          ${order.city ? `${order.city}, ` : ""}${order.pincode || ""}<br>
          Phone: ${order.phone}<br>
          ${order.email ? `Email: ${order.email}` : ""}
        </div>
      </div>
      <div>
        <div class="section-title">Atelier Dispatch Origin:</div>
        <div class="party-details">
          <strong>Duck Cosmetics Private Limited</strong><br>
          Level 4, Signature Towers, SG Highway<br>
          Bodakdev, Ahmedabad, Gujarat 380054, India<br>
          GSTIN: 24AAACD1234F1Z8 | HSN: 330499<br>
          Email: crm@duckcosmetics.in
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item & Formulation</th>
          <th class="text-center">Qty</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it) => `
          <tr>
            <td>
              <strong>${it.title}</strong>
              <div style="font-size: 11px; color: #71717A;">Atelier Batch #DK-${it.productId.substring(0, 6).toUpperCase()}</div>
            </td>
            <td class="text-center">${it.quantity}</td>
            <td class="text-right">&#8377;${it.price.toLocaleString("en-IN")}</td>
            <td class="text-right">&#8377;${(it.price * it.quantity).toLocaleString("en-IN")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="totals-container">
      <div class="totals-box">
        <div class="totals-row">
          <span>Taxable Value:</span>
          <span>&#8377;${taxableSubtotal.toLocaleString("en-IN")}</span>
        </div>
        <div class="totals-row">
          <span>IGST / CGST+SGST (18%):</span>
          <span>&#8377;${estimatedTax.toLocaleString("en-IN")}</span>
        </div>
        <div class="totals-row">
          <span>Complimentary Express Shipping:</span>
          <span style="color: #059669; font-weight: 600;">FREE</span>
        </div>
        <div class="totals-row grand-total">
          <span>Grand Total:</span>
          <span>&#8377;${order.totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for placing your trust in Duck Cosmetics Haute Atelier.</p>
      <p style="margin-top: 4px;">For assistance or order adjustments, contact crm@duckcosmetics.in or WhatsApp Concierge at +91 98250 10194.</p>
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Invoice GET error:", error);
    return new Response("Failed to generate invoice", { status: 500 });
  }
}
