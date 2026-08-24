import { useState } from "react";
import { sendContactMessage } from "../api/contact";
import Layout from "../components/Layout";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await sendContactMessage(form);
      setDone(true);
    } catch (err) {
      setError("Something went wrong sending your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-white border border-line rounded-lg px-4 py-3 text-espresso placeholder:text-muted/60 focus:outline-none focus:border-espresso transition";

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl md:text-4xl text-espresso text-center mb-10">Contact Us</h1>

        {done ? (
          <div className="bg-blush-100 rounded-2xl p-8 text-center text-espresso">
            Thanks for reaching out! We'll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className={inputClass}
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className={inputClass}
            />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className={inputClass}
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Message"
              rows={5}
              required
              className={inputClass}
            />

            {error && <p className="text-brick text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-espresso text-white text-sm font-semibold tracking-wide uppercase hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send"}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}

export default Contact;