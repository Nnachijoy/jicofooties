'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { naira } from '@/lib/products';

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: { product_name: string; size: string; quantity: number }[];
};

export default function Account() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const db = createClient();
        const {
          data: { user },
        } = await db.auth.getUser();
        if (user) {
          setUser(user.email || null);
          const { data, error } = await db
            .from('orders')
            .select(
              'id,status,total,created_at,items:order_items(product_name,size,quantity)'
            )
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (error) setNotice(error.message);
          else setOrders((data || []) as unknown as Order[]);

          const pending = new URLSearchParams(location.search);
          const productId = pending.get('add');
          const size = pending.get('size');
          if (productId && size) {
            const added = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ productId, size, quantity: 1 }),
            });
            if (added.ok) {
              location.replace('/cart');
              return;
            }
            const issue = await added.json();
            setNotice(issue.error || 'Could not add that pair to your bag.');
          }
        }
      } catch {
        setNotice('Connect Supabase to enable accounts.');
      }
    };
    init();
  }, []);

  async function auth() {
    setBusy(true);
    setNotice('');
    try {
      const db = createClient();
      const result =
        mode === 'signin'
          ? await db.auth.signInWithPassword({ email, password })
          : await db.auth.signUp({
              email,
              password,
              options: {
                data: { full_name: name },
                emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(
                  location.pathname + location.search
                )}`,
              },
            });
      if (result.error) throw result.error;

      if (mode === 'signup' && !result.data.session) {
        setConfirmEmail(email);
      } else {
        location.reload();
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  }

  async function forgotPassword() {
    if (!email) {
      setNotice('Enter your email address first, then click Forgot password.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const db = createClient();
      const { error } = await db.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setResetEmail(email);
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : 'Could not send reset code.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    if (!confirmEmail) return;
    setBusy(true);
    setNotice('');
    try {
      const db = createClient();
      const { error } = await db.auth.resend({
        type: 'signup',
        email: confirmEmail,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) throw error;
      setNotice('Sent again. Check your inbox.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not resend.');
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const db = createClient();
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(
          location.pathname + location.search
        )}`,
      },
    });
    if (error) setNotice(error.message);
  }

  async function signout() {
    const db = createClient();
    await db.auth.signOut();
    router.refresh();
    location.reload();
  }

  // ---- Screen 1: Signup confirmation ----
  if (confirmEmail) {
    return (
      <section className="page-width py-16 md:py-24 min-h-[70vh] flex items-center">
        <div className="max-w-md mx-auto w-full text-center fade-in">
          <p className="eyebrow text-[#77796f] mb-8">JICO FOOTIES</p>

          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full border border-black/15 grid place-items-center bg-[#e8e5de]">
              <Mail size={26} strokeWidth={1.5} className="text-[#465041]" />
            </div>
          </div>

          <h1 className="serif text-4xl md:text-5xl leading-tight">
            Check your inbox.
          </h1>

          <p className="text-sm text-[#60625b] mt-6 leading-7">
            We sent a confirmation link to
          </p>
          <p className="text-sm mt-1 text-[#181917] font-medium break-all">
            {confirmEmail}
          </p>
          <p className="text-sm text-[#60625b] mt-4 leading-7">
            Click the link inside to activate your account. If you don&apos;t
            see it, check your spam folder.
          </p>

          <div className="mt-9">
            <button
              onClick={resendConfirmation}
              disabled={busy}
              className="text-xs underline disabled:opacity-50 hover:text-[#465041]"
            >
              {busy ? 'Sending…' : "Didn't get it? Send again"}
            </button>
          </div>

          {notice && <p className="text-xs mt-5 text-[#465041]">{notice}</p>}

          <div className="mt-14 pt-8 border-t border-black/10">
            <button
              onClick={() => {
                setConfirmEmail(null);
                setMode('signin');
                setNotice('');
              }}
              className="text-xs underline text-[#77796f] hover:text-[#181917]"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ---- Screen 2: Password reset code sent ----
  if (resetEmail) {
    return (
      <section className="page-width py-16 md:py-24 min-h-[70vh] flex items-center">
        <div className="max-w-md mx-auto w-full text-center fade-in">
          <p className="eyebrow text-[#77796f] mb-8">JICO FOOTIES</p>

          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full border border-black/15 grid place-items-center bg-[#e8e5de]">
              <Mail size={26} strokeWidth={1.5} className="text-[#465041]" />
            </div>
          </div>

          <h1 className="serif text-4xl md:text-5xl leading-tight">
            Check your inbox.
          </h1>

          <p className="text-sm text-[#60625b] mt-6 leading-7">
            We sent a 6-digit reset code to
          </p>
          <p className="text-sm mt-1 text-[#181917] font-medium break-all">
            {resetEmail}
          </p>
          <p className="text-sm text-[#60625b] mt-4 leading-7">
            Open the email and copy the code. Then click below to enter it.
          </p>

          <Link
            href="/auth/reset"
            className="inline-block mt-8 bg-[#465041] text-white px-7 py-4 text-[10px] uppercase tracking-[.18em]"
          >
            Enter reset code
          </Link>

          <div className="mt-9">
            <button
              onClick={forgotPassword}
              disabled={busy}
              className="text-xs underline disabled:opacity-50 hover:text-[#465041]"
            >
              {busy ? 'Sending…' : "Didn't get it? Send again"}
            </button>
          </div>

          {notice && <p className="text-xs mt-5 text-[#465041]">{notice}</p>}

          <div className="mt-14 pt-8 border-t border-black/10">
            <button
              onClick={() => {
                setResetEmail(null);
                setMode('signin');
                setNotice('');
              }}
              className="text-xs underline text-[#77796f] hover:text-[#181917]"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ---- Screen 3: Signed-in view ----
  if (user) {
    return (
      <section className="page-width py-16 md:py-24 min-h-[55vh]">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end border-b border-black/15 pb-7">
            <div>
              <p className="eyebrow text-[#77796f]">Your JICO account</p>
              <h1 className="serif text-4xl mt-3">Good to have you back.</h1>
              <p className="text-xs text-[#77796f] mt-2">{user}</p>
            </div>
            <button onClick={signout} className="text-xs underline">
              Sign out
            </button>
          </div>

          <h2 className="serif text-2xl mt-9 mb-5">Your orders</h2>
          {orders.length ? (
            orders.map((o) => (
              <article
                key={o.id}
                className="border-t border-black/15 py-5 flex flex-col md:flex-row justify-between gap-3"
              >
                <div>
                  <p className="text-sm">
                    Order {o.id.slice(0, 8).toUpperCase()}{' '}
                    <span className="uppercase text-[9px] tracking-wider bg-[#e8e5de] px-2 py-1 ml-2">
                      {o.status}
                    </span>
                  </p>
                  <p className="text-xs text-[#77796f] mt-2">
                    {new Date(o.created_at).toLocaleDateString()} ·{' '}
                    {o.items
                      ?.map(
                        (i) => `${i.product_name}, size ${i.size} ×${i.quantity}`
                      )
                      .join(' · ')}
                  </p>
                </div>
                <p className="text-sm">{naira(o.total)}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-[#77796f]">
              No orders yet.{' '}
              <Link href="/shop" className="underline">
                Find your pair.
              </Link>
            </p>
          )}

          <h2 className="serif text-2xl mt-12 mb-5">Delivery addresses</h2>
          <AddressBook />
        </div>
      </section>
    );
  }

  // ---- Screen 4: Sign in / Sign up form ----
  return (
    <section className="page-width py-16 md:py-24 min-h-[55vh]">
      <div className="max-w-md mx-auto">
        <p className="eyebrow text-[#77796f]">JICO FOOTIES</p>
        <h1 className="serif text-4xl mt-3">
          {mode === 'signin' ? 'Welcome back.' : 'Make yourself at home.'}
        </h1>
        <p className="text-sm text-[#77796f] mt-3 mb-8">
          Sign in to keep your bag, details, and orders close.
        </p>

        {mode === 'signup' && (
          <label className="block mb-4 text-xs">
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full bg-transparent border-b border-black/25 py-3 mt-2 outline-none"
              autoComplete="name"
            />
          </label>
        )}

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
          Password
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full bg-transparent border-b border-black/25 py-3 mt-2 outline-none pr-12"
              autoComplete={
                mode === 'signin' ? 'current-password' : 'new-password'
              }
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

        {mode === 'signin' && (
          <div className="text-right mb-5">
            <button
              type="button"
              onClick={forgotPassword}
              disabled={busy}
              className="text-xs underline text-[#77796f] hover:text-[#181917] disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>
        )}

        {mode === 'signup' && <div className="mb-3" />}

        {notice && (
          <p
            className={`text-xs mb-4 ${
              notice.toLowerCase().includes('invalid') ||
              notice.toLowerCase().includes('failed') ||
              notice.toLowerCase().includes('incorrect') ||
              notice.toLowerCase().includes('error')
                ? 'text-[#b91c1c]'
                : 'text-[#465041]'
            }`}
          >
            {notice}
          </p>
        )}

        <button
          onClick={auth}
          disabled={busy}
          className="w-full bg-[#465041] text-white py-4 text-[10px] uppercase tracking-[.18em] disabled:opacity-60"
        >
          {busy
            ? 'Please wait…'
            : mode === 'signin'
            ? 'Sign in'
            : 'Create account'}
        </button>

        <button
          onClick={google}
          className="w-full border border-black/20 py-4 mt-3 text-xs"
        >
          Continue with Google
        </button>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-xs mt-6 underline"
        >
          {mode === 'signin'
            ? 'New here? Create an account'
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </section>
  );
}

function AddressBook() {
  const [rows, setRows] = useState<
    {
      id: string;
      label: string;
      full_name: string;
      phone: string;
      line1: string;
      city: string;
      state: string;
    }[]
  >([]);
  const [form, setForm] = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
  });
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const d = createClient();
      const { data } = await d
        .from('addresses')
        .select('*')
        .order('created_at');
      setRows(data || []);
    } catch {}
  };

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      const d = createClient();
      const { error } = await d.from('addresses').insert(form);
      if (error) throw error;
      setNotice('Address saved.');
      setForm({
        label: 'Home',
        full_name: '',
        phone: '',
        line1: '',
        city: '',
        state: '',
      });
      load();
    } catch (x) {
      setNotice(x instanceof Error ? x.message : 'Could not save address.');
    }
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-3">
        {rows.map((a) => (
          <div
            key={a.id}
            className="border border-black/15 p-4 text-xs leading-6"
          >
            <strong>
              {a.label} · {a.full_name}
            </strong>
            <br />
            {a.line1}, {a.city}, {a.state}
            <br />
            {a.phone}
          </div>
        ))}
      </div>

      <details className="mt-5">
        <summary className="text-xs underline cursor-pointer">
          Add a delivery address
        </summary>
        <form onSubmit={save} className="grid md:grid-cols-2 gap-3 mt-4">
          {Object.keys(form).map((k) => (
            <input
              key={k}
              required
              value={form[k as keyof typeof form]}
              placeholder={k.replace('_', ' ')}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="bg-transparent border-b border-black/20 py-3 text-xs"
            />
          ))}
          <button className="bg-[#465041] text-white py-3 text-xs">
            Save address
          </button>
        </form>
      </details>

      {notice && <p className="text-xs mt-3">{notice}</p>}
    </>
  );
}