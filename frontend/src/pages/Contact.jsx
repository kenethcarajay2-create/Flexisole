
import { useState } from "react";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Backend submission will be implemented later.
    alert("Contact form submission is not available yet.");
  }

  return (
    <main className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <section className="bg-brand-100 px-6 py-20 text-center sm:py-28">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-500">
          WE'RE HERE TO HELP
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-brand-900 sm:text-5xl lg:text-6xl">
          Get in Touch
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-brand-900/70">
          Have questions about FlexiSole products or your order?
          We'd love to hear from you.
        </p>
      </section>

      {/* Contact Content */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10">
        {/* Contact Information */}
        <div>
          <h2 className="text-3xl font-semibold text-brand-900">
            Let's talk comfort.
          </h2>

          <p className="mt-5 max-w-md leading-8 text-gray-600">
            Whether you have a product question, an order concern,
            or simply want to reach out, we're happy to help.
          </p>

          <div className="mt-10 space-y-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-brand-100 p-3 text-brand-900">
                <Mail size={23} />
              </div>
              <div>
                <h3 className="font-semibold text-brand-900">
                  Email Support
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Support email will be available soon.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-brand-100 p-3 text-brand-900">
                <MapPin size={23} />
              </div>
              <div>
                <h3 className="font-semibold text-brand-900">
                  Location
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Philippines
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-brand-100 p-3 text-brand-900">
                <MessageCircle size={23} />
              </div>
              <div>
                <h3 className="font-semibold text-brand-900">
                  Customer Assistance
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Contact channels will be added soon.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-3xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold text-brand-900">
            Send us a message
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Fill out the form below to prepare your inquiry.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="contact-name"
                className="mb-2 block text-sm font-medium text-brand-900"
              >
                Full Name
              </label>

              <input
                id="contact-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-2 block text-sm font-medium text-brand-900"
              >
                Email Address
              </label>

              <input
                id="contact-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-2 block text-sm font-medium text-brand-900"
              >
                Message
              </label>

              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                rows={5}
                required
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-brand-900 px-7 py-4 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Send Message
              <Send size={17} />
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Message delivery will be enabled when we connect the backend.
          </p>
        </div>
      </section>
    </main>
  );
}
