import { Order, StoreSettings } from "../types";
import { db } from "./db";

export const invoiceService = {
  generateTaxInvoiceHtml(order: Order, settings: StoreSettings = db.getSettings()): string {
    const isIntraState = order.cgst > 0 || order.sgst > 0;

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; padding: 24px; max-width: 800px; margin: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #681088; padding-bottom: 16px;">
          <div>
            <h1 style="color: #681088; margin: 0; font-size: 24px; font-weight: bold;">${settings.storeName}</h1>
            <p style="margin: 4px 0; font-size: 12px; color: #4b5563;">${settings.legalEntityName}</p>
            <p style="margin: 2px 0; font-size: 11px; color: #6b7280; max-width: 320px;">${settings.address}</p>
            <p style="margin: 2px 0; font-size: 11px; color: #4b5563;"><strong>GSTIN:</strong> ${settings.gstin} | <strong>PAN:</strong> ${settings.pan}</p>
            <p style="margin: 2px 0; font-size: 11px; color: #4b5563;"><strong>Email:</strong> ${settings.supportEmail} | <strong>Phone:</strong> ${settings.supportPhone1}</p>
          </div>
          <div style="text-align: right;">
            <span style="background: #eee2f4; color: #681088; padding: 4px 12px; font-weight: bold; border-radius: 4px; font-size: 12px; text-transform: uppercase;">TAX INVOICE</span>
            <h3 style="margin: 8px 0 4px; font-size: 16px;">${order.invoiceNumber || `INV-${order.orderNumber}`}</h3>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;"><strong>Order No:</strong> ${order.orderNumber}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;"><strong>Place of Supply:</strong> ${order.shippingAddress.state} (Code: ${isIntraState ? "24" : "Other"})</p>
          </div>
        </div>

        <!-- Bill To & Ship To -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; padding: 12px; background: #fdfafc; border-radius: 6px;">
          <div>
            <h4 style="margin: 0 0 6px; font-size: 11px; text-transform: uppercase; color: #681088;">Billed To:</h4>
            <strong style="font-size: 13px;">${order.billingAddress.fullName}</strong>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;">${order.billingAddress.addressLine1}${order.billingAddress.addressLine2 ? `, ${order.billingAddress.addressLine2}` : ""}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;">${order.billingAddress.city}, ${order.billingAddress.state} – ${order.billingAddress.pinCode}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;">Phone: ${order.customerPhone}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;">Email: ${order.customerEmail}</p>
          </div>
          <div>
            <h4 style="margin: 0 0 6px; font-size: 11px; text-transform: uppercase; color: #681088;">Shipped To:</h4>
            <strong style="font-size: 13px;">${order.shippingAddress.fullName}</strong>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;">${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;">${order.shippingAddress.city}, ${order.shippingAddress.state} – ${order.shippingAddress.pinCode}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;">Delivery Partner: ${order.shippingProvider || "Surface Courier"}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;">Tracking: ${order.trackingNumber || "Pending Dispatch"}</p>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
          <thead>
            <tr style="background: #681088; color: #fff; text-align: left;">
              <th style="padding: 8px;">#</th>
              <th style="padding: 8px;">Item Description</th>
              <th style="padding: 8px;">SKU</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Unit Price</th>
              <th style="padding: 8px; text-align: center;">GST %</th>
              <th style="padding: 8px; text-align: right;">Tax Amount</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item, idx) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px;">${idx + 1}</td>
                <td style="padding: 8px;"><strong>${item.name}</strong><br/><span style="font-size: 10px; color: #6b7280;">Category: ${item.category}</span></td>
                <td style="padding: 8px; font-family: monospace;">${item.sku}</td>
                <td style="padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; text-align: right;">₹${item.price.toFixed(2)}</td>
                <td style="padding: 8px; text-align: center;">${item.gstRate}%</td>
                <td style="padding: 8px; text-align: right;">₹${item.taxAmount.toFixed(2)}</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">₹${item.total.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <!-- Totals & Taxes Breakdown -->
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <div style="width: 50%; font-size: 11px; color: #4b5563; padding-right: 16px;">
            <p style="margin: 0 0 6px;"><strong>Payment Method:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
            ${order.paymentTransactionRef ? `<p style="margin: 2px 0;"><strong>Transaction Ref:</strong> ${order.paymentTransactionRef}</p>` : ""}
            <div style="margin-top: 12px; padding: 8px; border: 1px dashed #d1d5db; border-radius: 4px;">
              <strong>Declaration:</strong>
              <p style="margin: 2px 0; font-size: 10px; line-height: 1.4;">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Computer generated invoice, signature not required.</p>
            </div>
          </div>
          <div style="width: 45%;">
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr><td style="padding: 4px;">Items Subtotal</td><td style="text-align: right; font-weight: bold;">₹${order.subtotal.toFixed(2)}</td></tr>
              ${order.discountTotal > 0 ? `<tr><td style="padding: 4px; color: #e85f66;">Discount (${order.couponCode || "Promo"})</td><td style="text-align: right; color: #e85f66;">-₹${order.discountTotal.toFixed(2)}</td></tr>` : ""}
              <tr><td style="padding: 4px;">Shipping Charges</td><td style="text-align: right;">${order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee.toFixed(2)}`}</td></tr>
              ${
                isIntraState
                  ? `
                <tr><td style="padding: 4px; color: #6b7280;">CGST</td><td style="text-align: right; color: #6b7280;">₹${order.cgst.toFixed(2)}</td></tr>
                <tr><td style="padding: 4px; color: #6b7280;">SGST</td><td style="text-align: right; color: #6b7280;">₹${order.sgst.toFixed(2)}</td></tr>
              `
                  : `<tr><td style="padding: 4px; color: #6b7280;">IGST</td><td style="text-align: right; color: #6b7280;">₹${order.igst.toFixed(2)}</td></tr>`
              }
              <tr style="border-top: 2px solid #681088; font-size: 14px;">
                <td style="padding: 8px 4px; font-weight: bold; color: #681088;">Grand Total (INR)</td>
                <td style="padding: 8px 4px; text-align: right; font-weight: bold; color: #681088;">₹${order.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr><td style="padding: 2px 4px; color: #059669;">Amount Paid:</td><td style="text-align: right; font-weight: bold; color: #059669;">₹${order.amountPaid.toFixed(2)}</td></tr>
              ${order.amountDue > 0 ? `<tr><td style="padding: 2px 4px; color: #dc2626; font-weight: bold;">Amount Due (COD):</td><td style="text-align: right; font-weight: bold; color: #dc2626;">₹${order.amountDue.toFixed(2)}</td></tr>` : ""}
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 12px; text-align: center; font-size: 10px; color: #9ca3af;">
          Thank you for choosing ${settings.storeName}! For queries, please email ${settings.supportEmail} or call ${settings.supportPhone1}.
        </div>
      </div>
    `;
  },

  generatePackingSlipHtml(order: Order): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; padding: 24px; max-width: 800px; margin: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #374151; padding-bottom: 12px;">
          <div>
            <h2 style="margin: 0; color: #111827; font-size: 20px;">WAREHOUSE PACKING SLIP</h2>
            <p style="margin: 2px 0; font-size: 12px; color: #4b5563;">Order Ref: <strong>${order.orderNumber}</strong></p>
            <p style="margin: 2px 0; font-size: 11px; color: #6b7280;">Date: ${new Date(order.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 2px 0; font-size: 12px;"><strong>Assigned Staff:</strong> ${order.assignedStaffName || "Unassigned"}</p>
            <p style="margin: 2px 0; font-size: 12px;"><strong>Carrier:</strong> ${order.shippingProvider || "Surface Express"}</p>
          </div>
        </div>

        <div style="margin-top: 14px; padding: 10px; background: #f3f4f6; border-radius: 6px; font-size: 12px;">
          <strong>Pack & Ship To:</strong><br/>
          ${order.shippingAddress.fullName} | Phone: ${order.shippingAddress.phone}<br/>
          ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} – ${order.shippingAddress.pinCode}
        </div>

        ${order.packingNotes ? `<div style="margin-top: 10px; padding: 8px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; font-size: 11px; color: #92400e;"><strong>Special Packing Note:</strong> ${order.packingNotes}</div>` : ""}

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px;">
          <thead>
            <tr style="background: #e5e7eb; text-align: left;">
              <th style="padding: 8px; width: 40px;">Check</th>
              <th style="padding: 8px;">SKU</th>
              <th style="padding: 8px;">Product Name</th>
              <th style="padding: 8px;">Category</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; text-align: center;"><input type="checkbox" style="width: 16px; height: 16px;"/></td>
                <td style="padding: 8px; font-family: monospace;">${item.sku}</td>
                <td style="padding: 8px; font-weight: 600;">${item.name}</td>
                <td style="padding: 8px; color: #6b7280;">${item.category}</td>
                <td style="padding: 8px; text-align: center; font-size: 14px; font-weight: bold;">${item.quantity}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div style="margin-top: 24px; display: flex; justify-content: space-between; font-size: 11px; color: #4b5563; border-top: 1px solid #e5e7eb; pt: 12px;">
          <div>Packed By: ___________________</div>
          <div>Verified By: ___________________</div>
          <div>Date: ___________________</div>
        </div>
      </div>
    `;
  },

  generateShippingLabelHtml(order: Order, settings: StoreSettings = db.getSettings()): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111827; padding: 20px; max-width: 420px; margin: auto; background: #fff; border: 2px dashed #374151; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #111827; padding-bottom: 8px;">
          <h2 style="margin: 0; font-size: 18px; color: #681088;">DUCK COSMETICS</h2>
          <span style="font-weight: bold; font-size: 14px; text-transform: uppercase;">${order.shippingProvider || "COURIER"}</span>
        </div>

        <div style="margin: 12px 0; padding: 8px; border: 1px solid #111827; border-radius: 4px; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #4b5563;">AWB / Tracking Number</div>
          <div style="font-family: monospace; font-size: 18px; font-weight: bold; margin: 4px 0;">${order.trackingNumber || "DEL2026-UNASSIGNED"}</div>
          <div style="height: 36px; background: repeating-linear-gradient(90deg, #111827, #111827 2px, #fff 2px, #fff 5px, #111827 5px, #111827 8px); margin: 6px auto; width: 85%;"></div>
        </div>

        <div style="margin-top: 10px; font-size: 12px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #4b5563;">SHIP TO (DELIVERY ADDRESS):</div>
          <strong style="font-size: 14px; display: block; margin-top: 2px;">${order.shippingAddress.fullName}</strong>
          <p style="margin: 2px 0;">${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}</p>
          <p style="margin: 2px 0; font-size: 13px; font-weight: bold;">${order.shippingAddress.city}, ${order.shippingAddress.state} – <span style="font-size: 16px; background: #fffae6; padding: 1px 4px; border: 1px solid #facc15;">${order.shippingAddress.pinCode}</span></p>
          <p style="margin: 2px 0;">Contact: <strong>${order.shippingAddress.phone}</strong></p>
        </div>

        <div style="margin-top: 14px; padding-top: 8px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px;">
          <div>
            <span style="display: block; font-size: 9px; color: #6b7280;">RETURN TO / SHIPPER:</span>
            ${settings.storeName}<br/>
            Ahmedabad, Gujarat 380006<br/>
            Ph: ${settings.supportPhone1}
          </div>
          <div style="text-align: right;">
            <span style="display: block; font-size: 9px; color: #6b7280;">ORDER TYPE:</span>
            <strong style="font-size: 13px; color: ${order.paymentMethod === "Cash on Delivery" ? "#dc2626" : "#059669"};">
              ${order.paymentMethod === "Cash on Delivery" ? `COD: ₹${order.grandTotal}` : "PREPAID"}
            </strong><br/>
            Order: ${order.orderNumber}
          </div>
        </div>
      </div>
    `;
  },
};
