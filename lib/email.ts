import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const { data, error } = await resend.emails.send({
    from: 'JICO FOOTIES <onboarding@resend.dev>', // Change this after domain verification
    to: [to],
    subject: `Order Confirmation #${orderId.slice(0, 8)}`,
    react: OrderConfirmationEmail({ customerName, orderId, items, total }),
  });

  if (error) {
    console.error('Failed to send order confirmation:', error);
    return { success: false, error };
  }

  return { success: true, data };
}