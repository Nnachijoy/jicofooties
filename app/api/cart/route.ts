import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  productId: z.string().uuid(),
  size: z.string(),
  quantity: z.number().int().min(1).max(20),
});

export async function GET() {
  const db = await createClient();
  if (!db) {
    return NextResponse.json({ error: 'Store database is not configured.' }, { status: 503 });
  }
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to view your cart.' }, { status: 401 });
  }

  const { data: cartItems, error: cartError } = await db
    .from('cart_items')
    .select('id, quantity, variant_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (cartError) {
    return NextResponse.json({ error: cartError.message }, { status: 500 });
  }
  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const variantIds = cartItems.map((c) => c.variant_id);

  const { data: variants, error: varError } = await db
    .from('product_variants')
    .select('id, size, stock, product_id')
    .in('id', variantIds);

  if (varError) {
    return NextResponse.json({ error: varError.message }, { status: 500 });
  }

  const productIds = (variants || [])
    .map((v) => v.product_id)
    .filter(Boolean) as string[];

  const { data: products, error: prodError } = await db
    .from('products')
    .select('id, name, slug, price, image_url')
    .in('id', productIds);

  if (prodError) {
    return NextResponse.json({ error: prodError.message }, { status: 500 });
  }

  const items = cartItems.map((c) => {
    const variant = variants?.find((v) => v.id === c.variant_id);
    const product = products?.find((p) => p.id === variant?.product_id);
    return {
      id: c.id,
      quantity: c.quantity,
      variant:
        variant && product
          ? {
              id: variant.id,
              size: variant.size,
              stock: variant.stock,
              product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image_url: product.image_url,
              },
            }
          : null,
    };
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please select a valid size.' }, { status: 400 });
  }
  const db = await createClient();
  if (!db) {
    return NextResponse.json({ error: 'Store database is not configured.' }, { status: 503 });
  }
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to save your cart.' }, { status: 401 });
  }
  const { productId, size, quantity } = parsed.data;

  const { data: variant } = await db
    .from('product_variants')
    .select('id,stock')
    .eq('product_id', productId)
    .eq('size', size)
    .single();

  if (!variant || variant.stock < quantity) {
    return NextResponse.json({ error: 'That size is currently unavailable.' }, { status: 409 });
  }

  const { data: existing } = await db
    .from('cart_items')
    .select('quantity')
    .eq('user_id', user.id)
    .eq('variant_id', variant.id)
    .maybeSingle();

  const next = (existing?.quantity || 0) + quantity;

  if (next > variant.stock) {
    return NextResponse.json({ error: 'There is not enough stock for that quantity.' }, { status: 409 });
  }

  const result = await db
    .from('cart_items')
    .upsert(
      { user_id: user.id, variant_id: variant.id, quantity: next },
      { onConflict: 'user_id,variant_id' }
    );

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { id, quantity } = await req.json();
  const db = await createClient();
  if (!db) {
    return NextResponse.json({ error: 'Store database is not configured.' }, { status: 503 });
  }
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    return NextResponse.json({ error: 'Invalid quantity.' }, { status: 400 });
  }
  const { error } = await db
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .eq('user_id', user.id);
  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  const db = await createClient();
  if (!db) {
    return NextResponse.json({ error: 'Store database is not configured.' }, { status: 503 });
  }
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  const { error } = await db
    .from('cart_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ ok: true });
}