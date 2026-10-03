export const metadata = { title: 'Terms of Service — JICO FOOTIES' };

export default function Terms() {
  return (
    <section className="page-width py-16 md:py-24 max-w-3xl">
      <p className="eyebrow text-[#77796f] mb-4">LEGAL</p>
      <h1 className="serif text-4xl md:text-5xl mb-10">Terms of Service</h1>

      <div className="space-y-6 text-sm leading-relaxed text-[#3a3a38]">
        <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

        <p>
          By shopping with JICO FOOTIES you agree to these terms. Please read
          them carefully.
        </p>

        <h2 className="serif text-2xl mt-10">Orders and payment</h2>
        <p>
          All prices are in Nigerian Naira (₦) and include VAT where applicable.
          Payment must be completed before an order is processed. We accept card
          payments, bank transfers, and USSD via Paystack.
        </p>

        <h2 className="serif text-2xl mt-10">Shipping and delivery</h2>
        <p>
          We deliver nationwide across Nigeria. Delivery timelines are estimates
          and may vary. Free delivery is available on orders over ₦150,000.
        </p>

        <h2 className="serif text-2xl mt-10">Returns and exchanges</h2>
        <p>
          Unworn items in original packaging may be returned within 14 days of
          delivery for an exchange or refund. Return shipping costs are the
          customer's responsibility unless the item was faulty or incorrect.
        </p>

        <h2 className="serif text-2xl mt-10">Stock and availability</h2>
        <p>
          All items are subject to availability. If an item you've ordered is
          out of stock, we'll contact you to arrange an alternative or a full
          refund.
        </p>

        <h2 className="serif text-2xl mt-10">Your account</h2>
        <p>
          You are responsible for keeping your account details secure. Let us
          know immediately if you suspect unauthorised access.
        </p>

        <h2 className="serif text-2xl mt-10">Contact</h2>
        <p>
          For any questions about these terms, email hello@jicofooties.com.
        </p>
      </div>
    </section>
  );
}