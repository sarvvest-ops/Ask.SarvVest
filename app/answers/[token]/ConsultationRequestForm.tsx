"use client";

import { useState } from "react";

type ConsultationRequestFormProps = {
  token: string;
};

export default function ConsultationRequestForm({ token }: ConsultationRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`/api/answers/${token}/consultation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          preferred_time: preferredTime,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(result.error || "ثبت درخواست انجام نشد.");
        return;
      }

      setPhone("");
      setPreferredTime("");
      setMessage("درخواست شما ثبت شد. مشاور مالی شما برای هماهنگی تماس، درخواست را بررسی می‌کند.");
      setIsOpen(false);
    } catch {
      setIsError(true);
      setMessage("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-black text-emerald-950">نیاز به توضیح بیشتر دارید؟</div>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            اگر می‌خواهید جزئیات پرونده تلفنی بررسی شود، درخواست مشاوره تلفنی ثبت کنید.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="rounded-2xl bg-emerald-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
        >
          درخواست مشاوره تلفنی
        </button>
      </div>

      {isOpen && (
        <form onSubmit={submitRequest} className="mt-5 grid gap-3 rounded-3xl bg-emerald-50 p-4 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="شماره تماس"
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-800"
            required
          />
          <input
            value={preferredTime}
            onChange={(event) => setPreferredTime(event.target.value)}
            placeholder="زمان پیشنهادی تماس؛ مثلاً فردا ۱۰ تا ۱۲"
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-800"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-emerald-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : "ثبت درخواست"}
          </button>
        </form>
      )}

      {message && (
        <p
          className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-7 ${
            isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-950"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
