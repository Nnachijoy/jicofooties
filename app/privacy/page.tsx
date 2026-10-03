export const metadata = { title: 'Privacy Policy — JICO FOOTIES' };

export default function Privacy() {
  return (
    <section className="page-width py-16 md:py-24 max-w-3xl">
      <p className="eyebrow text-[#77796f] mb-4">LEGAL</p>
      <h1 className="serif text-4xl md:text-5xl mb-10">Privacy Policy</h1>

      <div className="space-y-6 text-sm leading-relaxed text-[#3a3a38]">
        <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

        <p>
          JICO FOOTIES ("we", "us") respects your privacy. This policy explains
          what information we collect when you shop with us and how we use it.
        </p>

        <h2 className="serif text-2xl mt-10">Information we collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Your name and email address when you create an account</li>
          <li>Your delivery address and phone number when you place an order</li>
          <li>Your order history and preferences</li>
          <li>Payment information is handled securely by Paystack — we never see or store your card details</li>
        </ul>

        <h2 className="serif text-2xl mt-10">How we use your information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To process and deliver your orders</li>
          <li>To send order confirmations and delivery updates</li>
          <li>To provide customer support</li>
          <li>To improve our store and product selection</li>
        </ul>

        <h2 className="serif text-2xl mt-10">Third parties</h2>
        <p>
          We share necessary information with trusted partners who help us run
          the store: Supabase (data storage), Paystack (payment processing),
          Mailgun (order emails), and our delivery partners. They only receive
          what they need to fulfil their service.
        </p>

        <h2 className="serif text-2xl mt-10">Your rights</h2>
        <p>
          You can access, update, or delete your account information at any
          time from your account page. To request deletion of your data, email
          us at hello@jicofooties.com.
        </p>

        <h2 className="serif text-2xl mt-10">Contact</h2>
        <p>
          Questions about privacy? Email hello@jicofooties.com.
        </p>
      </div>
    </section>
  );
}