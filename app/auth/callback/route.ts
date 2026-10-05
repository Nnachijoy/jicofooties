import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get('token_hash');
  const code = request.nextUrl.searchParams.get('code');
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null;
  const next = request.nextUrl.searchParams.get('next') || '/account';
  const safe =
    next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  const db = await createClient();

  if (db) {
    if (token_hash && type) {
      await db.auth.verifyOtp({ type, token_hash });
    } else if (code) {
      await db.auth.exchangeCodeForSession(code);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return NextResponse.redirect(new URL(safe, request.url));
}