"use client";

import { FormEvent, useState } from "react";
const MIN_QUESTION_LENGTH = 20;

export default function Home() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [category, setCategory] = useState("");
  const [amountRange, setAmountRange] = useState("");
  const [urgency, setUrgency] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          contact,
          question_text: questionText,
          category,
          amount_range: amountRange,
          urgency,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(result.error || "خطا در ثبت سؤال.");
        return;
      }

      setMessage(
        "سؤال شما با موفقیت ثبت شد. برای پاسخ دقیق‌تر، اطلاعات شما بررسی می‌شود."
      );

      setQuestionText("");
      setCategory("");
      setAmountRange("");
      setUrgency("");
    } catch {
      setIsError(true);
      setMessage("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-white text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
        <div className="text-2xl font-semibold tracking-tight text-emerald-950">
          Ask SarvVest
        </div>

        <nav className="hidden gap-8 text-sm text-slate-600 md:flex">
          <a href="#how" className="hover:text-emerald-950">
            نحوه کار
          </a>
          <a href="#for-who" className="hover:text-emerald-950">
            برای چه کسانی؟
          </a>
          <a href="#diagnosis" className="hover:text-emerald-950">
            Wealth Diagnosis
          </a>
        </nav>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center">
        <h1 className="max-w-3xl text-4xl font-bold leading-relaxed text-emerald-950 md:text-5xl">
          سؤال مالی خود را بپرسید؛
          <br />
          پاسخ ساختارمند و مشاورانه دریافت کنید.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
          Ask SarvVest به شما کمک می‌کند پیش از تصمیم‌گیری درباره پول نقد،
          طلا، دلار، صندوق، ملک یا بورس، ریسک‌ها و اطلاعات ناقص تصمیم خود را
          بهتر ببینید.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-100"
        >
          <textarea
  value={questionText}
  onChange={(e) => setQuestionText(e.target.value)}
  required
  minLength={MIN_QUESTION_LENGTH}
  placeholder="مثلاً: با ۵ میلیارد تومان نقد، بهتر است طلا بخرم، دلار نگه دارم یا وارد صندوق شوم؟"
  className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 px-5 py-4 text-right text-base leading-8 outline-none transition focus:border-emerald-800"
/>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-right outline-none transition focus:border-emerald-800"
            />

            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="شماره تماس یا ایمیل"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-right outline-none transition focus:border-emerald-800"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-right outline-none transition focus:border-emerald-800"
            >
              <option value="">موضوع سؤال</option>
              <option value="cash">پول نقد</option>
              <option value="gold-dollar">طلا و دلار</option>
              <option value="tether">تتر و دارایی دلاری</option>
              <option value="fund">صندوق</option>
              <option value="real-estate">ملک</option>
              <option value="stock">بورس</option>
              <option value="asset-allocation">ترکیب دارایی</option>
            </select>

            <select
              value={amountRange}
              onChange={(e) => setAmountRange(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-right outline-none transition focus:border-emerald-800"
            >
              <option value="">حدود مبلغ تصمیم</option>
              <option value="under-500m">کمتر از ۵۰۰ میلیون تومان</option>
              <option value="500m-2b">۵۰۰ میلیون تا ۲ میلیارد تومان</option>
              <option value="2b-10b">۲ تا ۱۰ میلیارد تومان</option>
              <option value="10b-50b">۱۰ تا ۵۰ میلیارد تومان</option>
              <option value="over-50b">بیش از ۵۰ میلیارد تومان</option>
            </select>
          </div>

          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-right outline-none transition focus:border-emerald-800"
          >
            <option value="">زمان تصمیم‌گیری</option>
            <option value="immediate">فوری</option>
            <option value="one-month">تا یک ماه آینده</option>
            <option value="three-months">تا سه ماه آینده</option>
            <option value="researching">فعلاً فقط در حال بررسی هستم</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-emerald-950 px-6 py-4 text-base font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : "دریافت تحلیل اولیه"}
          </button>

          {message && (
            <p
              className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-7 ${
                isError
                  ? "bg-red-50 text-red-700"
                  : "bg-emerald-50 text-emerald-950"
              }`}
            >
              {message}
            </p>
          )}

          <p className="mt-4 text-xs leading-6 text-slate-500">
            Ask SarvVest سیگنال خرید و فروش، وعده سود یا پیش‌بینی قطعی بازار
            ارائه نمی‌دهد. هدف، کمک به تصمیم‌گیری ساختارمندتر است.
          </p>
        </form>
      </section>

      <section id="how" className="border-t border-slate-100 bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-emerald-950">
            چگونه کار می‌کند؟
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-bold text-emerald-950">
                ۱. سؤال خود را ثبت کنید
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                سؤال مالی خود را به زبان ساده وارد کنید.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-bold text-emerald-950">
                ۲. بررسی اولیه انجام می‌شود
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                سؤال از نظر نوع تصمیم، مبلغ، فوریت و اطلاعات ناقص بررسی می‌شود.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-bold text-emerald-950">
                ۳. پاسخ ساختارمند دریافت می‌کنید
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                پاسخ شامل ریسک‌ها، محدودیت‌ها و مسیر تصمیم‌گیری محتاطانه است.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="for-who" className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-emerald-950">
            برای چه کسانی مناسب است؟
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-100 p-5">
              <h3 className="font-bold">دارندگان نقدینگی</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                افرادی که پول نقد آزاد دارند و نمی‌دانند چه کنند.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 p-5">
              <h3 className="font-bold">دارندگان طلا و دلار</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                کسانی که نگران وزن طلا و ارز در دارایی خود هستند.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 p-5">
              <h3 className="font-bold">تصمیم‌های ملکی</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                افرادی که بین خرید، فروش یا نگهداری ملک مرددند.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 p-5">
              <h3 className="font-bold">ترکیب دارایی</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                افرادی که می‌خواهند ریسک تمرکز دارایی را بهتر ببینند.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="diagnosis" className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <h2 className="text-2xl font-bold text-emerald-950">
            Wealth Diagnosis
          </h2>

          <p className="mt-4 max-w-3xl leading-8 text-slate-700">
            برای تصمیم‌های بزرگ، پاسخ کوتاه کافی نیست. در گزارش Wealth Diagnosis
            وضعیت دارایی، نقدشوندگی، ریسک تمرکز، افق زمانی و مسیر اقدام ۹۰ روزه
            بررسی می‌شود.
          </p>
        </div>
      </section>
    </main>
  );
}