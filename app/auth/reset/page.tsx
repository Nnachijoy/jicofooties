'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const db = createClient();
    // Supabase sets a session when the reset link is opened
    db.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });
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
      setNotice('Password updated. Redirecting…');
      setTimeout(() => router.push('/account'), 1200);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not update password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-width py-16 md:py-24 min-h-[70vh] flex items-center">
      <div className="max-w-md mx-auto w-full">
        <p className="eyebrow text-[#77796f]">JICO FOOTIES</p>
        <h1 className="serif text-4xl mt-3">Set a new password.</h1>
        <p className="text-sm text-[#77796f] mt-3 mb-8">
          Choose a strong password you&apos;ll remember.
        </p>

        {!ready ? (
          <p className="text-sm text-[#77796f]">
            Verifying your reset link…
          </p>
        ) : (
          <>
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

            <label className="block mb-6 text-xs">
              Confirm password
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="block w-full bg-transparent border-b border-black/25 py-3 mt-2 outline-none"
                autoComplete="new-password"
              />
            </label>

            <button
              onClick={submit}
              disabled={busy}
              className="w-full bg-[#465041] text-white py-4 text-[10px] uppercase tracking-[.18em] disabled:opacity-60"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>

            {notice && <p className="text-xs mt-5">{notice}</p>}
          </>
        )}
      </div>
    </section>
  );
}