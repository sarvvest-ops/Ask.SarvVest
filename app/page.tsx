"use client";

import { FormEvent, useMemo, useState } from "react";

const MIN_QUESTION_LENGTH = 20;

const questionExamples = [
  {
    label: "پول نقد دارم",
    category: "cash",
    text: "با پول نقدی که دارم، چطور بین طلا، دلار، صندوق درآمد ثابت و فرصت‌های دیگر تصمیم بگیرم؟",
  },
  {
    label: "طلا یا دلار؟",
    category: "gold-dollar",
    text: "برای حفظ ارزش دارایی در چند ماه آینده، طلا مناسب‌تر است یا دلار و تتر؟",
  },
  {
    label: "ملک یا صندوق؟",
    category: "real-estate",
    text: "بین خرید ملک، نگهداری نقدینگی و سرمایه‌گذاری در صندوق‌ها، کدام مسیر برای شرایط من منطقی‌تر است؟",
  },
  {
    label: "ترکیب دارایی",
    category: "asset-allocation",
    text: "می‌خواهم ترکیب دارایی فعلی‌ام را از نظر ریسک، نقدشوندگی و تمرکز بیش از حد بررسی کنم.",
  },
];

const categoryOptions = [
  ["cash", "پول نقد"],
  ["gold-dollar", "طلا و دلار"],
  ["tether", "تتر و دارایی دلاری"],
  ["fund", "صندوق"],
  ["real-estate", "ملک"],
  ["stock", "بورس"],
  ["asset-allocation", "ترکیب دارایی"],
] as const;

const amountOptions = [
  ["under-500m", "کمتر از ۵۰۰ میلیون تومان"],
  ["500m-2b", "۵۰۰ میلیون تا ۲ میلیارد تومان"],
  ["2b-10b", "۲ تا ۱۰ میلیارد تومان"],
  ["10b-50b", "۱۰ تا ۵۰ میلیارد تومان"],
  ["over-50b", "بیش از ۵۰ میلیارد تومان"],
] as const;

const urgencyOptions = [
  ["immediate", "فوری"],
  ["one-month", "تا یک ماه آینده"],
  ["three-months", "تا سه ماه آینده"],
  ["researching", "فعلاً فقط در حال بررسی هستم"],
] as const;

const goalOptions = [
  ["preserve", "حفظ ارزش پول"],
  ["growth", "رشد سرمایه"],
  ["income", "درآمد دوره‌ای"],
  ["risk-control", "کاهش ریسک"],
] as const;

const horizonOptions = [
  ["under-3m", "کمتر از ۳ ماه"],
  ["3m-12m", "۳ تا ۱۲ ماه"],
  ["over-12m", "بیشتر از یک سال"],
] as const;

const riskOptions = [
  ["low", "کم"],
  ["medium", "متوسط"],
  ["high", "زیاد"],
] as const;

const liquidityOptions = [
  ["high", "زیاد؛ شاید زود به پول نیاز داشته باشم"],
  ["medium", "متوسط؛ بخشی از پول باید نقد بماند"],
  ["low", "کم؛ فعلاً نیاز فوری به پول نقد ندارم"],
] as const;

const experienceOptions = [
  ["beginner", "تازه‌کار"],
  ["intermediate", "متوسط"],
  ["advanced", "حرفه‌ای"],
] as const;

const labels: Record<string, string> = Object.fromEntries([
  ...categoryOptions,
  ...amountOptions,
  ...urgencyOptions,
  ...goalOptions,
  ...horizonOptions,
  ...riskOptions,
  ...liquidityOptions,
  ...experienceOptions,
]);

export default function Home() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [category, setCategory] = useState("");
  const [amountRange, setAmountRange] = useState("");
  const [urgency, setUrgency] = useState("");
  const [financialGoal, setFinancialGoal] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");
  const [riskTolerance, setRiskTolerance] = useState("");
  const [liquidityNeed, setLiquidityNeed] = useState("");
  const [currentAssets, setCurrentAssets] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpense, setMonthlyExpense] = useState("");
  const [investmentExperience, setInvestmentExperience] = useState("");
  const [investmentConstraints, setInvestmentConstraints] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const characterCount = questionText.trim().length;

  const profileSummary = useMemo(
    () =>
      [
        financialGoal ? `هدف: ${labels[financialGoal]}` : "",
        timeHorizon ? `افق زمانی: ${labels[timeHorizon]}` : "",
        riskTolerance ? `ریسک‌پذیری: ${labels[riskTolerance]}` : "",
        liquidityNeed ? `نیاز نقدینگی: ${labels[liquidityNeed]}` : "",
      ].filter(Boolean),
    [financialGoal, timeHorizon, riskTolerance, liquidityNeed]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedContact = contact.trim();
    const trimmedQuestionText = questionText.trim();

    setMessage("");
    setIsError(false);

    if (!trimmedName) {
      setIsError(true);
      setMessage("لطفاً نام خود را وارد کنید.");
      return;
    }

    if (!trimmedContact || trimmedContact.length < 5) {
      setIsError(true);
      setMessage("لطفاً شماره تماس یا ایمیل معتبر وارد کنید.");
      return;
    }

    if (trimmedQuestionText.length < MIN_QUESTION_LENGTH) {
      setIsError(true);
      setMessage(`متن سؤال باید حداقل ${MIN_QUESTION_LENGTH} کاراکتر باشد.`);
      return;
    }

    if (!category) {
      setIsError(true);
      setMessage("لطفاً موضوع سؤال را انتخاب کنید.");
      return;
    }

    if (!financialGoal || !timeHorizon || !riskTolerance || !liquidityNeed) {
      setIsError(true);
      setMessage("لطفاً هدف مالی، افق زمانی، ریسک‌پذیری و نیاز نقدینگی را کامل کنید.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          contact: trimmedContact,
          question_text: trimmedQuestionText,
          category,
          amount_range: amountRange,
          urgency,
          financial_goal: financialGoal,
          time_horizon: timeHorizon,
          risk_tolerance: riskTolerance,
          liquidity_need: liquidityNeed,
          current_assets: currentAssets,
          monthly_income: monthlyIncome,
          monthly_expense: monthlyExpense,
          investment_experience: investmentExperience,
          investment_constraints: investmentConstraints,
          company,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(result.error || "خطا در ثبت اطلاعات.");
        return;
      }

      setMessage(
        "پروفایل مالی اولیه و سؤال شما ثبت شد. در نسخه بعدی، پاسخ اولیه AI بر اساس همین داده‌ها ساخته می‌شود."
      );

      setName("");
      setContact("");
      setQuestionText("");
      setCategory("");
      setAmountRange("");
      setUrgency("");
      setFinancialGoal("");
      setTimeHorizon("");
      setRiskTolerance("");
      setLiquidityNeed("");
      setCurrentAssets("");
      setMonthlyIncome("");
      setMonthlyExpense("");
      setInvestmentExperience("");
      setInvestmentConstraints("");
      setCompany("");
    } catch {
      setIsError(true);
      setMessage("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#fbfbf8] text-slate-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-950 text-sm font-bold text-white">
            SV
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-emerald-950">
              Ask SarvVest
            </div>
            <div className="text-xs text-slate-500">Financial Decision System</div>
          </div>
        </div>

        <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
          <a href="#how" className="hover:text-emerald-950">
            نحوه کار
          </a>
          <a href="#for-who" className="hover:text-emerald-950">
            مناسب چه کسانی؟
          </a>
          <a href="/admin/questions" className="hover:text-emerald-950">
            پنل ادمین
          </a>
        </nav>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pb-16 pt-10 text-center">
        <p className="mb-5 rounded-full border border-emerald-900/10 bg-white px-4 py-2 text-xs font-medium text-emerald-950 shadow-sm">
          نسخه اولیه سیستم تصمیم‌یار مالی سرووست
        </p>

        <h1 className="max-w-4xl text-4xl font-black leading-[1.7] tracking-tight text-emerald-950 md:text-6xl">
          پروفایل مالی‌ات را بساز؛
          <br /> تصمیم را ساختارمندتر ببین.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
          Ask SarvVest قرار نیست فقط یک سایت پرسش و پاسخ باشد. اینجا ابتدا یک تصویر
          اولیه از هدف، ریسک، نقدشوندگی و ترکیب دارایی ساخته می‌شود تا بعداً پاسخ
          اولیه AI و در صورت نیاز بررسی تخصصی انسانی روی آن انجام شود.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {questionExamples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => {
                setQuestionText(example.text);
                setCategory(example.category);
              }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:border-emerald-950 hover:text-emerald-950"
            >
              {example.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-4 text-right shadow-2xl shadow-slate-200/70 md:p-6"
        >
          <label className="hidden" aria-hidden="true">
            شرکت
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={name}
              required
              onChange={(event) => setName(event.target.value)}
              placeholder="نام"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-right outline-none transition focus:border-emerald-800"
            />

            <input
              value={contact}
              required
              minLength={5}
              onChange={(event) => setContact(event.target.value)}
              placeholder="شماره تماس یا ایمیل"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-right outline-none transition focus:border-emerald-800"
            />
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-3 text-sm font-black text-emerald-950">۱. هدف و چارچوب تصمیم</div>
            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={financialGoal}
                required
                onChange={(event) => setFinancialGoal(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right outline-none transition focus:border-emerald-800"
              >
                <option value="">هدف مالی</option>
                {goalOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={timeHorizon}
                required
                onChange={(event) => setTimeHorizon(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right outline-none transition focus:border-emerald-800"
              >
                <option value="">افق زمانی</option>
                {horizonOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={riskTolerance}
                required
                onChange={(event) => setRiskTolerance(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right outline-none transition focus:border-emerald-800"
              >
                <option value="">تحمل ریسک</option>
                {riskOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <select
                value={liquidityNeed}
                required
                onChange={(event) => setLiquidityNeed(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right outline-none transition focus:border-emerald-800"
              >
                <option value="">نیاز به نقدینگی</option>
                {liquidityOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={amountRange}
                onChange={(event) => setAmountRange(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right outline-none transition focus:border-emerald-800"
              >
                <option value="">حدود مبلغ تصمیم</option>
                {amountOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={urgency}
                onChange={(event) => setUrgency(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right outline-none transition focus:border-emerald-800"
              >
                <option value="">زمان تصمیم‌گیری</option>
                {urgencyOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4">
            <div className="mb-3 text-sm font-black text-emerald-950">۲. وضعیت مالی فعلی</div>
            <textarea
              value={currentAssets}
              onChange={(event) => setCurrentAssets(event.target.value)}
              placeholder="ترکیب دارایی فعلی را خیلی ساده بنویس؛ مثلاً: ۴۰٪ ملک، ۳۰٪ طلا، ۲۰٪ تتر، ۱۰٪ نقد"
              className="min-h-28 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right leading-7 outline-none transition focus:border-emerald-800"
            />

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <input
                value={monthlyIncome}
                onChange={(event) => setMonthlyIncome(event.target.value)}
                placeholder="درآمد ماهانه تقریبی"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-right outline-none transition focus:border-emerald-800"
              />
              <input
                value={monthlyExpense}
                onChange={(event) => setMonthlyExpense(event.target.value)}
                placeholder="هزینه ماهانه تقریبی"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-right outline-none transition focus:border-emerald-800"
              />
              <select
                value={investmentExperience}
                onChange={(event) => setInvestmentExperience(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right outline-none transition focus:border-emerald-800"
              >
                <option value="">تجربه سرمایه‌گذاری</option>
                {experienceOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={investmentConstraints}
              onChange={(event) => setInvestmentConstraints(event.target.value)}
              placeholder="محدودیت‌ها یا خط قرمزها؛ مثلاً: نمی‌خواهم وارد بورس شوم، نیاز دارم بخشی همیشه نقد باشد، با تتر مشکل دارم..."
              className="mt-3 min-h-24 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right leading-7 outline-none transition focus:border-emerald-800"
            />
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-3 focus-within:border-emerald-900 md:p-4">
            <div className="mb-2 text-sm font-black text-emerald-950">۳. سؤال اصلی شما</div>
            <textarea
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              required
              minLength={MIN_QUESTION_LENGTH}
              placeholder="مثلاً: با ۵ میلیارد تومان نقد، بهتر است طلا بخرم، دلار نگه دارم یا وارد صندوق شوم؟"
              className="min-h-32 w-full resize-none bg-transparent px-3 py-3 text-right text-base leading-8 outline-none md:text-lg"
            />
            <div className="flex items-center justify-between border-t border-slate-200 px-3 pt-3 text-xs text-slate-500">
              <span>{characterCount} کاراکتر</span>
              <span>حداقل {MIN_QUESTION_LENGTH} کاراکتر</span>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <select
              value={category}
              required
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right outline-none transition focus:border-emerald-800"
            >
              <option value="">موضوع سؤال</option>
              {categoryOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600 md:col-span-2">
              {profileSummary.length
                ? profileSummary.join(" | ")
                : "با تکمیل فرم، یک IPS ساده و مسیر بررسی اولیه ساخته می‌شود."}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-emerald-950 px-6 py-4 text-base font-bold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : "ثبت پروفایل مالی و شروع بررسی"}
          </button>

          {message && (
            <p
              className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-7 ${
                isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-950"
              }`}
            >
              {message}
            </p>
          )}

          <p className="mt-4 text-center text-xs leading-6 text-slate-500">
            این سرویس پیشنهاد شخصی‌سازی‌شده قطعی، سیگنال خرید و فروش یا وعده سود
            ارائه نمی‌دهد؛ هدف، ساختن چارچوب تصمیم‌گیری و تشخیص نیاز به بررسی تخصصی است.
          </p>
        </form>
      </section>

      <section id="how" className="border-y border-slate-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-black text-emerald-950 md:text-3xl">
              مسیر درست Ask SarvVest
            </h2>
            <p className="mt-4 leading-8 text-slate-600">
              هدف نهایی، ساخت پرونده مالی، IPS ساده، پاسخ اولیه AI و ارجاع موارد مهم به
              بررسی تخصصی انسانی است.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              ["۱", "پروفایل مالی", "هدف، افق زمانی، نقدشوندگی، ریسک و دارایی فعلی ثبت می‌شود."],
              ["۲", "IPS ساده", "سیستم یک خلاصه اولیه از وضعیت و محدودیت‌های تصمیم می‌سازد."],
              ["۳", "پاسخ اولیه", "در مرحله بعد AI بر اساس همین داده‌ها پیش‌نویس پاسخ می‌دهد."],
              ["۴", "بررسی انسانی", "موارد پیچیده، بزرگ یا پرریسک برای بررسی تخصصی جدا می‌شوند."],
            ].map(([step, title, description]) => (
              <div key={step} className="rounded-3xl border border-slate-100 bg-[#fbfbf8] p-6">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-950 text-lg font-bold text-white">
                  {step}
                </div>
                <h3 className="font-bold text-emerald-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="for-who" className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-4">
          {[
            ["نقدینگی آزاد", "برای کسانی که نمی‌دانند پول نقد را نگه دارند یا تبدیل کنند."],
            ["طلا و ارز", "برای مقایسه تصمیم بین طلا، دلار، تتر و ریسک نگهداری."],
            ["ملک و صندوق", "برای بررسی نقدشوندگی، بازده مورد انتظار و ریسک تمرکز."],
            ["سبد دارایی", "برای دیدن وزن دارایی‌ها، تمرکز ریسک و مسیر بازچینی."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-emerald-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-8 text-center text-xs leading-6 text-slate-500">
        Ask SarvVest یک ابزار تصمیم‌یار آموزشی و تحلیلی است و جایگزین مشاوره رسمی
        سرمایه‌گذاری، مالیاتی یا حقوقی نیست.
      </footer>
    </main>
  );
}
