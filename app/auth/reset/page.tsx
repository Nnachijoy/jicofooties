'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [state, setState] = useState<'verifying' | 'ready' | 'done' | 'error'>(
    'verifying'
  );

  useEffect(() => {
    const db = createClient();

    async function init() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam =
        params.get('error_description') || params.get('error');

      if (errorParam) {
        setNotice(decodeURIComponent(errorParam.replace(/\+/g, ' ')));
        setState('error');
        return;
      }

      if (code) {
        const { error } = await db.auth.exchangeCodeForSession(code);
        if (error) {
          setNotice(error.message);
          setState('error');
          return;
        }
        setState('ready');
        // Clean the code from the URL so refresh doesn't break it
        window.history.replaceState({}, '', '/auth/reset');
        return;
      }

      // No code in URL — maybe a session already exists (user opened it directly)
      const { data } = await db.auth.getSession();
      if (data.session) {
        setState('ready');
      } else {
        setNotice('This reset link is invalid or has expired.');
        setState('error');
      }
    }

    init();
  }, []);

  async function submit() {
    if (password.length < 6) {
      setNotice('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setNotice('Passwords do not match.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const db = createClient();
      const { error } = await db.auth.updateUser({ password });
      if (error) throw error;
      setState('done');
      setTimeout(() => router.push('/account'), 1800);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not update password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-width py-16 md:py-24 min-h-[70vh] flex items-center">
      <div className="max-w-md mx-auto w-full fade-in">
        <p className="eyebrow text-[#77796f]">JICO FOOTIES</p>

        {state === 'verifying' && (
          <>
            <h1 className="serif text-4xl mt-3">Verifying your reset link…</h1>
            <p className="text-sm text-[#77796f] mt-3">
              This usually takes a second.
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <h1 className="serif text-4xl mt-3">Link expired.</h1>
            <p className="text-sm text-[#77796f] mt-4 leading-7">
              This password reset link is no longer valid. Request a new one
              from the sign-in page.
            </p>
            {notice && (
              <p className="text-xs mt-4 text-[#b91c1c]">{notice}</p>
            )}
            <Link
              href="/account"
              className="inline-block mt-8 bg-[#465041] text-white px-7 py-4 text-[10px] uppercase tracking-[.18em]"
            >
              Back to sign in
            </Link>
          </>
        )}

        {state === 'ready' && (
          <>
            <h1 className="serif text-4xl mt-3">Set a new password.</h1>
            <p className="text-sm text-[#77796f] mt-3 mb-8">
              Choose a strong password you&apos;ll remember.
            </p>

            <label className="block mb-4 text-xs">
              New password
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-transparent border-b border-black/25 py-3 mt-2 outline-none pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-0 bottom-3 text-[11px] tracking-wider uppercase text-[#77796f] hover:text-[#181917]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label className="block mb-2 text-xs">
              Confirm password
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="block w-full bg-transparent border-b border-black/25 py-3 mt-2 outline-none pr-12"
                  autoComplete="new-password"
                />
              </div>
            </label>

            {notice && (
              <p className="text-xs mt-3 text-[#b91c1c]">{notice}</p>
            )}

            <button
              onClick={submit}
              disabled={busy}
              className="w-full bg-[#465041] text-white py-4 mt-6 text-[10px] uppercase tracking-[.18em] disabled:opacity-60"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </>
        )}

        {state === 'done' && (
          <>
            <div className="flex justify-center mb-8 mt-6">
              <div className="w-20 h-20 rounded-full border border-black/15 grid place-items-center bg-[#e8e5de]">
                <Mail size={26} strokeWidth={1.5} className="text-[#465041]" />
              </div>
            </div>
            <h1 className="serif text-4xl text-center leading-tight">
              Password updated.
            </h1>
            <p className="text-sm text-[#60625b] mt-6 text-center leading-7">
              Taking you back to sign in…
            </p>
          </>
        )}
      </div>
    </section>
  );
}