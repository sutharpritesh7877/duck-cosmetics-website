/**
 * Duck Cosmetics Automated Email Notification & Marketing Dispatcher
 * Supports Brevo, Resend, or Generic Webhook with safe dev fallback.
 */

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

const EMAIL_FROM = process.env.EMAIL_FROM || "Duck Cosmetics Atelier <concierge@duckcosmetics.com>";
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@duckcosmetics.com";
const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

export async function sendEmail({
  to,
  toName,
  subject,
  htmlContent,
  textContent,
}: SendEmailParams): Promise<{ success: boolean; id?: string }> {
  // 1. Try Brevo (Sendinblue) API if configured
  if (BREVO_API_KEY && !BREVO_API_KEY.includes("your-")) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: "Duck Cosmetics Concierge", email: "concierge@duckcosmetics.com" },
          to: [{ email: to, name: toName || to.split("@")[0] }],
          subject,
          htmlContent,
          textContent: textContent || subject,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, id: data.messageId };
      }
    } catch (err) {
      console.warn("[Email Service] Brevo API dispatch warning:", err);
    }
  }

  // 2. Try Resend API if configured
  if (RESEND_API_KEY && !RESEND_API_KEY.includes("your-")) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [to],
          subject,
          html: htmlContent,
          text: textContent || subject,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, id: data.id };
      }
    } catch (err) {
      console.warn("[Email Service] Resend API dispatch warning:", err);
    }
  }

  // 3. Fallback: Log email in development
  console.log(`[Email Dispatch Simulation]
    To: ${to} (${toName || "Guest"})
    Subject: ${subject}
    From: ${EMAIL_FROM}
    Timestamp: ${new Date().toISOString()}
  `);

  return { success: true, id: `sim-${Date.now()}` };
}

/**
 * Triggers automated Password Reset email with secure 15-minute token link
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  name?: string
): Promise<{ success: boolean; id?: string }> {
  const subject = "Reset Your Duck Cosmetics Security Password · VIP Atelier Access";
  const recipientName = name || email.split("@")[0] || "Valued VIP Client";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F6FA; margin: 0; padding: 24px; color: #1A1A1A; }
          .container { max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #EADBF7; box-shadow: 0 12px 32px rgba(93, 58, 122, 0.08); }
          .header { background-color: #5D3A7A; padding: 36px 28px; text-align: center; }
          .header h1 { color: #FFFFFF; font-size: 24px; font-weight: 400; letter-spacing: 4px; margin: 0; text-transform: uppercase; font-family: 'Playfair Display', Georgia, serif; }
          .header p { color: #EADBF7; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; margin: 8px 0 0 0; }
          .body { padding: 36px 32px; line-height: 1.6; }
          .greeting { font-size: 18px; font-weight: 600; color: #1A1A1A; margin-bottom: 12px; }
          .message { font-size: 14px; color: #4A4A4A; margin-bottom: 24px; }
          .btn-wrapper { text-align: center; margin: 32px 0; }
          .btn { background-color: #5D3A7A; color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 14px rgba(93, 58, 122, 0.25); }
          .warning-box { background-color: #F8F6FA; border: 1px solid #EADBF7; border-radius: 12px; padding: 14px 18px; font-size: 12px; color: #5D3A7A; margin: 24px 0; line-height: 1.5; }
          .footer { background-color: #FAF9FB; padding: 24px 32px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #EADBF7; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>dUCK COSMETICS</h1>
            <p>Atelier Security & VIP Access</p>
          </div>
          <div class="body">
            <div class="greeting">Bonjour, ${recipientName}</div>
            <p class="message">
              We received a request to securely reset the password for your Duck Cosmetics VIP client account.
            </p>
            <div class="btn-wrapper">
              <a href="${resetUrl}" class="btn">RESET YOUR PASSWORD</a>
            </div>
            <div class="warning-box">
              ⏱ <strong>Strict Security Notice:</strong> This password reset link is time-limited and will strictly expire in <strong>15 minutes</strong>. If you did not initiate this request, you may safely ignore this message—your account remains protected.
            </div>
            <p style="font-size: 12px; color: #666666; margin-top: 24px;">
              If the button above does not work, copy and paste this URL into your browser:<br>
              <a href="${resetUrl}" style="color: #5D3A7A; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          <div class="footer">
            © 2026 Duck Cosmetics Private Limited · Ahmedabad Atelier, Gujarat, India<br>
            Haute Botanicals & Dermatological Formulations
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    toName: recipientName,
    subject,
    htmlContent,
    textContent: `Bonjour ${recipientName}, reset your Duck Cosmetics password within 15 minutes by clicking: ${resetUrl}`,
  });
}

/**
 * Triggers automated VIP Welcome email upon joining Waitlist
 */
export async function sendWaitlistWelcomeEmail(email: string, source: string = "Hero CTA") {
  const subject = "Welcome to Duck Cosmetics VIP Atelier · Inaugural Drop Allocation";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F6FA; margin: 0; padding: 40px 20px; color: #1A1A1A; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px 32px; border: 1px solid #E8E2EE; }
          .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #F0EAF5; }
          .logo-title { color: #5D3A7A; font-size: 26px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin: 0; }
          .badge { display: inline-block; background: #F8F6FA; color: #5D3A7A; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 12px; border: 1px solid #E8E2EE; }
          .content { padding: 32px 0; line-height: 1.7; font-size: 15px; color: #4A4A4A; }
          .headline { font-size: 22px; font-weight: 700; color: #1A1A1A; margin-bottom: 16px; }
          .card { background: #F8F6FA; border-radius: 16px; padding: 20px; margin: 24px 0; border: 1px solid #E8E2EE; }
          .footer { text-align: center; border-top: 1px solid #F0EAF5; padding-top: 24px; font-size: 12px; color: #8A8A8A; }
          .btn { display: inline-block; background: #5D3A7A; color: #ffffff !important; padding: 14px 28px; border-radius: 30px; font-weight: 600; text-decoration: none; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-title">dUCK COSMETICS</h1>
            <div class="badge">Pre-Launch VIP Access</div>
          </div>
          <div class="content">
            <div class="headline">Your Inaugural Allocation is Reserved.</div>
            <p>Dear VIP Patron,</p>
            <p>Thank you for joining the private waitlist for <strong>Duck Cosmetics</strong>. Our formulation atelier in Grasse and research laboratories in Ahmedabad are preparing our debut drop of conscious, clinical botanicals and pure Ayurvedic nectars.</p>
            
            <div class="card">
              <strong style="color: #5D3A7A; display: block; margin-bottom: 8px;">Your VIP Inscription Details:</strong>
              <div>• Priority Member: <strong>${email}</strong></div>
              <div>• Allocation Source: <strong>${source}</strong></div>
              <div>• Status: <strong>Confirmed · Inaugural Drop Guarantee</strong></div>
            </div>

            <p>As a confirmed VIP member, you will receive:</p>
            <ul>
              <li><strong>48-Hour Priority Window</strong> before public availability</li>
              <li><strong>Complimentary Deluxe Travel Formulation</strong> on your inaugural order</li>
              <li>Direct telephone & WhatsApp concierge line access</li>
            </ul>

            <center>
              <a href="https://duckcosmetics.com/shop" class="btn">Preview The Atelier Catalog</a>
            </center>
          </div>
          <div class="footer">
            <p>Duck Cosmetics Inc. · SG Highway, Bodakdev, Ahmedabad, Gujarat 380054</p>
            <p>100% Cruelty-Free · Dermatologically Verified · Pediatrician Approved</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    htmlContent,
  });
}

/**
 * Sends customer auto-responder upon submitting Contact / Concierge form
 */
export async function sendContactAutoresponderEmail(email: string, name: string, message: string) {
  const subject = "Duck Cosmetics Concierge · We Have Received Your Inquiry";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F6FA; margin: 0; padding: 40px 20px; color: #1A1A1A; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px 32px; border: 1px solid #E8E2EE; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #F0EAF5; }
          .logo-title { color: #5D3A7A; font-size: 24px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin: 0; }
          .content { padding: 28px 0; line-height: 1.7; font-size: 15px; color: #4A4A4A; }
          .quote { background: #F8F6FA; border-left: 3px solid #5D3A7A; padding: 14px 18px; margin: 18px 0; border-radius: 0 12px 12px 0; font-style: italic; }
          .footer { text-align: center; border-top: 1px solid #F0EAF5; padding-top: 20px; font-size: 12px; color: #8A8A8A; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-title">dUCK COSMETICS</h1>
            <p style="color: #5D3A7A; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 6px 0 0;">Client Concierge Desk</p>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>We have received your message. Our client concierge team at our Ahmedabad atelier has logged your inquiry and will respond within 24 business hours.</p>
            
            <div class="quote">
              "${message.slice(0, 300)}${message.length > 300 ? "..." : ""}"
            </div>

            <p>If you require immediate telephone assistance, our dedicated direct concierge lines are available:</p>
            <p><strong>+91 79 4001 8899</strong> · <strong>+91 98250 12345</strong></p>
          </div>
          <div class="footer">
            <p>Duck Cosmetics Haute Atelier · Care for Every Little Moment.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    toName: name,
    subject,
    htmlContent,
  });
}

/**
 * Notifies admin team when a new contact inquiry arrives
 */
export async function sendAdminContactNotification({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const subject = `[New Client Inquiry] ${name} via Contact Concierge`;
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>New Client Inscription Received</h2>
      <p><strong>Client Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f4f4f4; padding: 12px; border-left: 4px solid #5D3A7A;">${message}</blockquote>
      <p><small>View in Duck Admin OMS: <a href="https://duckcosmetics.com/admin/contact">/admin/contact</a></small></p>
    </div>
  `;

  return sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject,
    htmlContent,
  });
}
