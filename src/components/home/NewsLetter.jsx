import React, { useState } from "react";
import { shopify } from "@/lib/shopify";
import { NEWSLETTER_SIGNUP } from "@/lib/queries";
import { Label } from "../ui/label";

export default function NewsLetter({ className = "" }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [waOptIn, setWaOptIn] = useState(true);
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ ok: false, msg: "" });
  const [hp, setHp] = useState(""); // honeypot

  const makeRandomPassword = () => {
    try {
      const arr = new Uint32Array(3);
      crypto.getRandomValues(arr);
      return Array.from(arr).map(n => n.toString(36)).join("-");
    } catch {
      return Math.random().toString(36).slice(2) + "-" + Date.now();
    }
  };

  const normalizePhone = (raw) => {
    if (!raw) return "";
    let p = (raw + "").replace(/[()\-\s]/g, "");
    if (p.startsWith("+")) return p;
    if (/^[6-9]\d{9}$/.test(p)) return `+91${p}`;
    return p;
  };
  const validatePhone = (raw) => {
    if (!raw) return true;
    const p = normalizePhone(raw);
    return /^\+\d{7,15}$/.test(p);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (hp) return;
    if (!email) return setStatus({ ok: false, msg: "Please enter your email." });

    if (waOptIn && !phone) {
      return setStatus({ ok: false, msg: "Add your WhatsApp number or uncheck WhatsApp updates." });
    }
    if (phone && !validatePhone(phone)) {
      return setStatus({ ok: false, msg: "Enter a valid mobile number (e.g., +919876543210 or 9876543210)." });
    }

    setLoading(true);
    setStatus({ ok: false, msg: "" });

    try {
      const password = makeRandomPassword();
      const phoneE164 = normalizePhone(phone);

      const data = await shopify(NEWSLETTER_SIGNUP, {
        email,
        acceptsMarketing: consent,
        password,
        phone: phoneE164 || null,
      });

      const errs =
        data?.customerCreate?.customerUserErrors ||
        data?.customerCreate?.userErrors ||
        [];
      if (errs.length) throw new Error(errs.map(e => e.message).join(", "));

      setStatus({ ok: true, msg: "Thanks! Please check your email to confirm your subscription." });
      setEmail("");
      setPhone("");
      setWaOptIn(true);
    } catch (err) {
      setStatus({ ok: false, msg: err.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`w-full bg-white text-primary ${className}`}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3 items-start">
          {/* Copy */}
          <div className="md:col-span-1 flex flex-col justify-start text-center md:text-left">
            <h3 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl uppercase">
              Join Our Newsletter
            </h3>
            <p className="montserrat-500 mt-2 text-sm sm:text-base text-primary">
              Style tips, early access to drops, and members-only offers. No spam—unsubscribe anytime.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="md:col-span-2">
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="flex flex-col gap-3">
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="newsletter-email"
                  className="font-semibold text-primary text-sm sm:text-base tracking-wide"
                >
                  Let’s be friends
                </Label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="w-full rounded-lg border border-primary/30 bg-white/80 px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-primary/50"
                  autoComplete="email"
                />
              </div>

              {/* WhatsApp Field */}
              <div className="flex flex-col gap-2 mt-4">
                <Label
                  htmlFor="newsletter-phone"
                  className="font-semibold text-primary text-sm sm:text-base tracking-wide"
                >
                  Stay in touch on WhatsApp
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="newsletter-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98XXX XXX89"
                    className="w-full sm:flex-1 rounded-lg border border-primary/30 bg-white/80 px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-primary/50"
                    autoComplete="tel"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-white text-sm sm:text-base font-medium transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    {loading ? "Subscribing…" : "Subscribe"}
                  </button>
                </div>
              </div>
            </div>

            {/* Consents */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-2">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <label htmlFor="consent" className="text-xs sm:text-sm text-primary montserrat-500">
                  I agree to receive marketing emails from Delan. Read our{" "}
                  <a href="/privacy-policy" className="underline underline-offset-2">
                    Privacy Policy
                  </a>.
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="waOptIn"
                  type="checkbox"
                  checked={waOptIn}
                  onChange={(e) => setWaOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <label htmlFor="waOptIn" className="text-xs sm:text-sm text-primary montserrat-500">
                  Send me updates on <span className="font-semibold">WhatsApp</span>.
                </label>
              </div>
            </div>

            {/* Status */}
            <div className="mt-3 min-h-[1.25rem]" role="status" aria-live="polite">
              {status.msg && (
                <p className={`${status.ok ? "text-green-700" : "text-red-700"} text-sm`}>
                  {status.msg}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
