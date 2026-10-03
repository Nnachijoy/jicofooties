import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    const db = await createClient();
    if (db) {
      await db.auth.exchangeCodeForSession(code);
      // Workaround for Supabase SSR bug where cookies are written in a
      // deferred setTimeout that runs after the response is sent.
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  const next = request.nextUrl.searchParams.get('next') || '/account';
  const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/account';
  return NextResponse.redirect(new URL(safe, request.url));
}