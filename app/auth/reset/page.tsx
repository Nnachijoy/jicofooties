'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPassword() {
  const router = useRouter();
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function verifyCode() {
    if (!email || !code) {
      setNotice('Enter your email and the code from your inbox.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const db = createClient();
      const { error } = await db.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'recovery',
      });
      if (error) throw error;
      setStep('password');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Invalid or expired code.');
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword() {
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
      setTimeout(() => router.push('/account'), 1500);
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

        {step === 'code' ? (
          <>
            <h1 className="serif text-4xl mt-3">Enter your reset code.</h1>
            <p className="text-sm text-[#77796f] mt-3 mb-8">
              Check your inbox (and spam folder) for an email from JICO
              FOOTIES with your reset code.
            </p>

            <label className="block mb-4 text-xs">
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-transparent border-b border-black/25 py-3 mt-2 outline-none"
                autoComplete="email"
              />
            </label>

            <label className="block mb-2 text-xs">
              Reset code
              <input
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 8))
                }
                inputMode="numeric"
                maxLength={8}
                className="block w-full bg-transparent border-b border-black/25 py-3 mt-2 outline-none tracking-[.4em] text-lg"
                placeholder="00000000"
              />
            </label>

            {notice && <p className="text-xs mt-4 text-[#b91c1c]">{notice}</p>}

            <button
              onClick={verifyCode}
              disabled={busy}
              className="w-full bg-[#465041] text-white py-4 mt-6 text-[10px] uppercase tracking-[.18em] disabled:opacity-60"
            >
              {busy ? 'Verifying…' : 'Verify code'}
            </button>

            <Link
              href="/account"
              className="block text-center text-xs underline mt-6 text-[#77796f]"
            >
              ← Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="serif text-4xl mt-3">Set a new password.</h1>

            <label className="block mb-4 mt-8 text-xs">
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
                  className="absolute right-0 bottom-3 text-[11px] tracking-wider uppercase text-[#77796f]"
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

            {notice && <p className="text-xs mt-3 text-[#b91c1c]">{notice}</p>}

            <button
              onClick={updatePassword}
              disabled={busy}
              className="w-full bg-[#465041] text-white py-4 mt-6 text-[10px] uppercase tracking-[.18em] disabled:opacity-60"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}