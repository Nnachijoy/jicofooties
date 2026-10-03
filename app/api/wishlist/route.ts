import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const db = await createClient();
  if (!db) {
    return NextResponse.json({ error: 'Store database is not configured.' }, { status: 503 });
  }
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ items: [] });
  }
  const { data, error } = await db
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: Request) {
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
  const body = await req.json().catch(() => ({}));
  const productId = body?.productId as string | undefined;
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId.' }, { status: 400 });
  }
  const { error } = await db
    .from('wishlists')
    .upsert(
      { user_id: user.id, product_id: productId },
      { onConflict: 'user_id,product_id' }
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
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

  let productId: string | null = null;
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    productId = (body?.productId as string) || null;
  }
  if (!productId) {
    productId = new URL(req.url).searchParams.get('productId');
  }

  if (!productId) {
    return NextResponse.json({ error: 'Missing productId.' }, { status: 400 });
  }
  const { error } = await db
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}