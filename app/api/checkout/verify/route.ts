import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { sendOrderConfirmation } from '@/lib/email';

async function receipt(reference: string, userId: string, userEmail: string) {
  const admin = createAdmin();
  const { data: order } = await admin
    .from('orders')
    .select(
      'id,status,user_id,total,address:addresses(full_name,line1,city,state,phone),items:order_items(product_name,size,quantity,unit_price)'
    )
    .eq('paystack_reference', reference)
    .single();

  if (!order || order.user_id !== userId) {
    throw new Error('Order not found.');
  }

  if (order.status === 'pending') {
    const check = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );
    const body = await check.json();

    if (
      !check.ok ||
      body.data?.status !== 'success' ||
      body.data.amount !== order.total * 100 ||
      body.data.currency !== 'NGN' ||
      body.data.customer?.email?.toLowerCase() !== userEmail.toLowerCase()
    ) {
      throw new Error('Payment could not be verified.');
    }

    const { error } = await admin.rpc('complete_paid_order', {
      p_reference: reference,
      p_user_id: userId,
      p_paid_at: body.data.paid_at,
    });
    if (error) throw new Error(error.message);

    // Clear the user's cart
    const { data: cart } = await admin
      .from('cart_items')
      .select('id')
      .eq('user_id', userId);
    if (cart?.length) {
      await admin.from('cart_items').delete().eq('user_id', userId);
    }

    // Send order confirmation email via Brevo
    if (process.env.BREVO_API_KEY) {
      try {
        const address = Array.isArray(order.address)
          ? order.address[0]
          : order.address;
        const items = (order.items || []).map((i: any) => ({
          name: i.product_name,
          size: i.size,
          quantity: i.quantity,
          price: i.unit_price,
        }));

        await sendOrderConfirmation({
          to: body.data.customer.email,
          customerName: address?.full_name || 'there',
          orderId: order.id,
          items,
          total: order.total,
        });
      } catch (emailErr) {
        console.error('Order email delivery failed:', emailErr);
      }
    }
  }

  return order;
}

export async function POST(req: Request) {
  try {
    const db = await createClient();
    if (!db) {
      return NextResponse.json(
        { error: 'Store database is not configured.' },
        { status: 503 }
      );
    }
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Sign in to verify payment.' },
        { status: 401 }
      );
    }
    const { reference } = await req.json();
    if (typeof reference !== 'string' || !reference) {
      return NextResponse.json(
        { error: 'Payment reference required.' },
        { status: 400 }
      );
    }
    const order = await receipt(reference, user.id, user.email || '');
    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Verification failed.' },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  const db = await createClient();
  const {
    data: { user },
  } = db ? await db.auth.getUser() : { data: { user: null } };
  const reference = new URL(req.url).searchParams.get('reference');

  if (!user || !reference) {
    return NextResponse.redirect(
      new URL('/account?notice=payment-verification-needed', req.url)
    );
  }

  try {
    await receipt(reference, user.id, user.email || '');
    return NextResponse.redirect(
      new URL(`/account?order=${encodeURIComponent(reference)}`, req.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL('/checkout?notice=payment-unverified', req.url)
    );
  }
}