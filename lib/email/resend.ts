import { Resend } from 'resend';
import { db } from '@/lib/db';
import { emailNotifications } from '@/lib/db/schema';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'hello@gloriahmutheu.com';

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  return new Resend(key);
}

type OrderConfirmationData = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: { titleSnapshot: string; quantity: number; priceKesSnapshot: number }[];
  subtotalKes: number;
  shippingFeeKes: number;
  totalKes: number;
};

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
  const formatKes = (n: number) => `KES ${n.toLocaleString()}`;

  const itemRows = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e8e8e4;font-family:Georgia,serif;font-style:italic">${i.titleSnapshot}${i.quantity > 1 ? ` × ${i.quantity}` : ''}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e8e8e4;text-align:right;font-family:sans-serif">${formatKes(i.priceKesSnapshot * i.quantity)}</td>
        </tr>`,
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order confirmation</title></head>
<body style="margin:0;padding:0;background:#F5F4F2;font-family:sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;padding:40px">
    <h1 style="font-family:Georgia,serif;font-style:italic;color:#1a1a1a;font-weight:normal;margin:0 0 8px">Thank you, ${data.customerName}</h1>
    <p style="color:#666;font-size:14px;margin:0 0 32px">Your order has been confirmed. We'll be in touch when it ships.</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemRows}
      <tr>
        <td style="padding:8px 0;font-family:sans-serif;font-size:13px;color:#888">Shipping</td>
        <td style="padding:8px 0;text-align:right;font-family:sans-serif;font-size:13px;color:#888">${formatKes(data.shippingFeeKes)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-family:sans-serif;font-size:15px;color:#1a1a1a;font-weight:600">Total</td>
        <td style="padding:12px 0 0;text-align:right;font-family:sans-serif;font-size:15px;color:#1a1a1a;font-weight:600">${formatKes(data.totalKes)}</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #e8e8e4;margin:32px 0">
    <p style="font-size:12px;color:#999;margin:0">Order reference: <code>${data.orderId}</code></p>
    <p style="font-size:12px;color:#999;margin:8px 0 0">Questions? Reply to this email or contact <a href="mailto:${FROM}" style="color:#7a6b5e">${FROM}</a></p>
  </div>
</body>
</html>`;

  const text = `Thank you for your order, ${data.customerName}!\n\nItems:\n${data.items.map((i) => `  ${i.titleSnapshot}${i.quantity > 1 ? ` × ${i.quantity}` : ''} — ${formatKes(i.priceKesSnapshot * i.quantity)}`).join('\n')}\n\nShipping: ${formatKes(data.shippingFeeKes)}\nTotal: ${formatKes(data.totalKes)}\n\nOrder reference: ${data.orderId}`;

  let status: 'sent' | 'failed' = 'sent';
  let resendResponse: unknown = null;

  try {
    const res = await getResend().emails.send({
      from: `Gloriah Mutheu <${FROM}>`,
      to: data.customerEmail,
      subject: 'Your order is confirmed — Gloriah Mutheu',
      html,
      text,
    });
    resendResponse = res;
  } catch (err) {
    status = 'failed';
    resendResponse = { error: String(err) };
  }

  await db.insert(emailNotifications).values({
    email: data.customerEmail,
    action: 'order_confirmation',
    status,
    resendResponse,
    metadata: { orderId: data.orderId },
  });
}

type NewInquiryData = {
  adminEmail: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
};

export async function sendNewInquiryNotification(data: NewInquiryData): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New inquiry</title></head>
<body style="margin:0;padding:0;background:#F5F4F2;font-family:sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;padding:40px">
    <h1 style="font-family:Georgia,serif;font-style:italic;color:#1a1a1a;font-weight:normal;margin:0 0 24px">New inquiry — ${data.subject}</h1>
    <p style="margin:0 0 4px;font-size:14px;color:#888">From: <strong style="color:#1a1a1a">${data.senderName}</strong> &lt;${data.senderEmail}&gt;</p>
    <hr style="border:none;border-top:1px solid #e8e8e4;margin:20px 0">
    <p style="font-size:15px;color:#333;white-space:pre-wrap;line-height:1.6">${data.message}</p>
    <hr style="border:none;border-top:1px solid #e8e8e4;margin:24px 0">
    <a href="mailto:${data.senderEmail}?subject=Re: ${encodeURIComponent(data.subject)}" style="font-family:sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#1a1a1a;text-decoration:none;border:1px solid #1a1a1a;padding:10px 20px;display:inline-block">Reply</a>
  </div>
</body>
</html>`;

  const text = `New inquiry (${data.subject})\nFrom: ${data.senderName} <${data.senderEmail}>\n\n${data.message}`;

  let status: 'sent' | 'failed' = 'sent';
  let resendResponse: unknown = null;

  try {
    const res = await getResend().emails.send({
      from: `Gloriah Mutheu Site <${FROM}>`,
      to: data.adminEmail,
      replyTo: data.senderEmail,
      subject: `New inquiry: ${data.subject} — ${data.senderName}`,
      html,
      text,
    });
    resendResponse = res;
  } catch (err) {
    status = 'failed';
    resendResponse = { error: String(err) };
  }

  await db.insert(emailNotifications).values({
    email: data.adminEmail,
    action: 'new_inquiry_notification',
    status,
    resendResponse,
    metadata: { senderEmail: data.senderEmail },
  });
}
