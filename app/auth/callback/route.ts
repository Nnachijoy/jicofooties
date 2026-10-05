import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') || '/account';
  const safe =
    next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  if (code) {
    const db = await createClient();
    if (db) {
      await db.auth.exchangeCodeForSession(code);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return NextResponse.redirect(new URL(safe, request.url));
}