const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

export async function sendOrderConfirmation({
  to,
  customerName,
  orderId,
  items,
  total,
}: {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; size: string; quantity: number; price: number }[];
  total: number;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'JICO FOOTIES';

  if (!apiKey || !senderEmail) {
    console.error('Brevo not configured');
    return { success: false, error: 'Email not configured' };
  }

  const itemsHtml = items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0">${i.name} (Size ${i.size})</td><td style="text-align:center">x${i.quantity}</td><td style="text-align:right">₦${(i.price * i.quantity).toLocaleString()}</td></tr>`
    )
    .join('');

  const htmlContent = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#181917">
      <h1 style="font-size:24px;font-weight:500">Thank you, ${customerName}.</h1>
      <p>Your order <strong>#${orderId.slice(0, 8)}</strong> has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:20px">
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="text-align:right;font-size:18px;margin-top:20px"><strong>Total: ₦${total.toLocaleString()}</strong></p>
      <p style="margin-top:30px;font-size:13px;color:#77796f">JICO FOOTIES · Lagos, Nigeria</p>
    </div>
  `;

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to, name: customerName }],
        subject: `Order Confirmation #${orderId.slice(0, 8)}`,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Brevo send failed:', res.status, errText);
      return { success: false, error: errText };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error('Brevo network error:', err);
    return { success: false, error: err };
  }
}