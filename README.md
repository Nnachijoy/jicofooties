# JICO FOOTIES

Next.js storefront and Supabase-backed commerce app.

## Run locally

1. Copy `.env.example` to `.env.local` and fill in the credentials below.
2. In the Supabase SQL Editor, run `supabase/migrations/001_store.sql` to create tables, RLS policies, the image bucket, and initial catalog records.
3. In Supabase Authentication, enable email/password and Google. Add `http://localhost:3000/auth/callback` and the production callback URL to the allowed redirect URLs. Configure the Google OAuth client in Supabase with the callback URL shown in its provider settings.
4. Add your admin email to `ADMIN_EMAILS`.
5. Run `npm install`, `npm run dev`.

For production, set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS storefront URL and add that URL plus `/auth/callback` to Supabase's allowed redirects.

## Payment and email

Set the Paystack secret key only in server environment variables. The checkout endpoint initializes transactions and the verification endpoint checks the transaction with Paystack before creating a paid order, decrementing size inventory, and sending the confirmation email. Keep the Paystack dashboard in test mode until test checkout and verification are complete.

Set the Mailgun API key, verified sending domain, and sender in server environment variables. Email delivery is attempted after successful payment verification; failures are logged server-side and do not reverse a verified payment.

## Data and access

Catalog records and initial size stock are inserted by the migration and are managed through `/admin`. Customer carts, wishlists, addresses, and order history are stored in Supabase. RLS scopes customer rows to `auth.uid()`; privileged order creation, payment confirmation, and admin actions use the server-only service role key.
