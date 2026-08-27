import { useState } from "react";
import { sendContactMessage } from "../api/contact";
import Layout from "../components/Layout";

const REQUIRED_MESSAGES = {
  name: "Enter your name",
  email: "Enter your email",
  message: "Enter a message",
};

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [attempted, setAttempted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = REQUIRED_MESSAGES.name;
    if (!form.email.trim()) errs.email = REQUIRED_MESSAGES.email;
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.message.trim()) errs.message = REQUIRED_MESSAGES.message;
    return errs;
  };

  const errors = attempted ? validate() : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setError("");

    const errs = validate();
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await sendContactMessage(form);
      setDone(true);
    } catch (err) {
      setError("Something went wrong sending your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full bg-white border rounded-lg px-4 py-3 text-espresso placeholder:text-muted/60 focus:outline-none transition ${
      hasError ? "border-brick" : "border-line focus:border-espresso"
    }`;

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl md:text-4xl text-espresso text-center mb-10">Contact Us</h1>

        {done ? (
          <div className="bg-blush-100 rounded-2xl p-8 text-center text-espresso">
            Thanks for reaching out! We'll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className={inputClass(errors.name)}
              />
              {errors.name && <p className="text-brick text-xs mt-1.5">{errors.name}</p>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className={inputClass(errors.email)}
              />
              {errors.email && <p className="text-brick text-xs mt-1.5">{errors.email}</p>}
            </div>

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className={inputClass(false)}
            />

            <div>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Message"
                rows={5}
                className={inputClass(errors.message)}
              />
              {errors.message && <p className="text-brick text-xs mt-1.5">{errors.message}</p>}
            </div>

            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-brick/10 border border-brick/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brick shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-brick text-sm leading-snug">{error}</p>
              </div>
            )}

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