import { createClient } from "@supabase/supabase-js";
import { updateQuestion } from "./actions";
import CopyAnswerLink from "./CopyAnswerLink";
import CopyUserMessage from "./CopyUserMessage";

export const dynamic = "force-dynamic";

type Question = {
  id: string;
  created_at: string;
  name: string | null;
  contact: string | null;
  question_text: string;
  category: string | null;
  amount_range: string | null;
  urgency: string | null;
  status: string;
  final_answer: string | null;
  is_wealth_diagnosis_candidate: boolean;
};

function translateCategory(category: string | null) {
  const map: Record<string, string> = {
    cash: "پول نقد",
    "gold-dollar": "طلا و دلار",
    tether: "تتر و دارایی دلاری",
    fund: "صندوق",
    "real-estate": "ملک",
    stock: "بورس",
    "asset-allocation": "ترکیب دارایی",
  };

  return category ? map[category] || category : "-";
}

function translateAmount(amount: string | null) {
  const map: Record<string, string> = {
    "under-500m": "کمتر از ۵۰۰ میلیون",
    "500m-2b": "۵۰۰ میلیون تا ۲ میلیارد",
    "2b-10b": "۲ تا ۱۰ میلیارد",
    "10b-50b": "۱۰ تا ۵۰ میلیارد",
    "over-50b": "بیش از ۵۰ میلیارد",
  };

  return amount ? map[amount] || amount : "-";
}

function translateUrgency(urgency: string | null) {
  const map: Record<string, string> = {
    immediate: "فوری",
    "one-month": "تا یک ماه آینده",
    "three-months": "تا سه ماه آینده",
    researching: "در حال بررسی",
  };

  return urgency ? map[urgency] || urgency : "-";
}

function translateStatus(status: string) {
  const map: Record<string, string> = {
    new: "جدید",
    reviewing: "در حال بررسی",
    needs_more_info: "نیازمند اطلاعات بیشتر",
    answered: "پاسخ داده‌شده",
    diagnosis_candidate: "کاندید Wealth Diagnosis",
    sent_to_user: "ارسال‌شده برای کاربر",
  };

  return map[status] || status;
}

const FILTER_OPTIONS = [
  { value: "all", label: "همه" },
  { value: "new", label: "جدید" },
  { value: "reviewing", label: "در حال بررسی" },
  { value: "needs_more_info", label: "نیازمند اطلاعات" },
  { value: "answered", label: "پاسخ داده‌شده" },
  { value: "sent_to_user", label: "ارسال‌شده" },
  { value: "wealth_diagnosis", label: "Wealth Diagnosis" },
] as const;

type AdminFilter = (typeof FILTER_OPTIONS)[number]["value"];

function getActiveFilter(value: string | undefined): AdminFilter {
  const isValid = FILTER_OPTIONS.some((option) => option.value === value);
  return isValid ? (value as AdminFilter) : "all";
}

function filterQuestions(questions: Question[], filter: AdminFilter) {
  if (filter === "all") {
    return questions;
  }

  if (filter === "wealth_diagnosis") {
    return questions.filter(
      (q) => q.is_wealth_diagnosis_candidate || q.status === "diagnosis_candidate"
    );
  }

  return questions.filter((q) => q.status === filter);
}

function buildAnswerTemplate(q: Question) {
  return `۱. پاسخ کوتاه
با توجه به سؤال شما، این تصمیم بدون دانستن هدف، افق زمانی، نیاز نقدینگی و ترکیب فعلی دارایی قابل پاسخ قطعی نیست. اما می‌توان چارچوب تصمیم را بررسی کرد.

۲. دلیل
موضوع سؤال شما: ${translateCategory(q.category)}
حدود مبلغ تصمیم: ${translateAmount(q.amount_range)}
فوریت تصمیم: ${translateUrgency(q.urgency)}

در چنین تصمیمی باید مشخص شود این پول برای حفظ ارزش، سرمایه‌گذاری بلندمدت، خرید دارایی، نقدینگی اضطراری یا هدف مشخص دیگری نگهداری می‌شود.

۳. ریسک‌های پنهان
- ریسک تمرکز بیش از حد در یک دارایی
- ریسک نقدشوندگی در زمان نیاز به پول
- ریسک تصمیم‌گیری هیجانی بر اساس نوسان کوتاه‌مدت بازار
- ریسک نادیده گرفتن افق زمانی و تعهدات مالی آینده

۴. اقدام پیشنهادی
پیشنهاد می‌شود قبل از تصمیم نهایی، ترکیب تقریبی دارایی، نیاز نقدینگی ۳ تا ۱۲ ماه آینده، افق زمانی و میزان تحمل افت دارایی مشخص شود.

۵. کارهایی که فعلاً نباید انجام شود
- ورود یکباره همه مبلغ به یک دارایی
- تصمیم‌گیری فقط بر اساس رشد اخیر بازار
- خرید یا فروش هیجانی
- پذیرش ریسک بدون مشخص بودن هدف و افق زمانی

۶. اطلاعات ناقص
برای پاسخ دقیق‌تر، این اطلاعات لازم است:
- هدف اصلی این پول
- افق زمانی تصمیم
- ترکیب فعلی دارایی‌ها
- میزان نیاز به نقدینگی
- بدهی یا تعهد مالی مهم
- دارایی‌هایی که نمی‌خواهید بفروشید

۷. سطح اطمینان
متوسط رو به پایین، چون اطلاعات مالی کامل هنوز وارد نشده است.

۸. پیشنهاد بررسی انسانی
اگر این تصمیم بخش قابل توجهی از دارایی شما را درگیر می‌کند، بهتر است بررسی تخصصی‌تر Wealth Diagnosis انجام شود.`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
    const params = searchParams ? await searchParams : {};
  const activeFilter = getActiveFilter(params.status);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <main dir="rtl" className="min-h-screen bg-white p-8 text-slate-900">
        <h1 className="text-2xl font-bold text-red-700">
          تنظیمات Supabase کامل نیست.
        </h1>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main dir="rtl" className="min-h-screen bg-white p-8 text-slate-900">
        <h1 className="text-2xl font-bold text-red-700">
          خطا در دریافت سؤال‌ها
        </h1>
        <p className="mt-4 leading-8 text-slate-700">{error.message}</p>
      </main>
    );
  }

  const questions = (data || []) as Question[];

  const stats = [
  {
    label: "کل سؤال‌ها",
    value: questions.length,
    hint: "همه درخواست‌های ثبت‌شده",
  },
  {
    label: "جدید",
    value: questions.filter((q) => q.status === "new").length,
    hint: "هنوز بررسی نشده",
  },
  {
    label: "در حال بررسی",
    value: questions.filter((q) => q.status === "reviewing").length,
    hint: "در صف پاسخ‌دهی",
  },
  {
    label: "نیازمند اطلاعات",
    value: questions.filter((q) => q.status === "needs_more_info").length,
    hint: "باید از کاربر سؤال تکمیلی بگیریم",
  },
  {
    label: "پاسخ داده‌شده",
    value: questions.filter((q) => q.status === "answered").length,
    hint: "پاسخ آماده شده",
  },
  {
    label: "ارسال‌شده",
    value: questions.filter((q) => q.status === "sent_to_user").length,
    hint: "لینک پاسخ برای کاربر ارسال شده",
  },
  {
    label: "Wealth Diagnosis",
    value: questions.filter((q) => q.is_wealth_diagnosis_candidate).length,
    hint: "مناسب برای بررسی تخصصی",
  },
];

  const filteredQuestions = filterQuestions(questions, activeFilter);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-950">
              پنل داخلی Ask SarvVest
            </h1>
            <p className="mt-2 text-slate-600">
              مدیریت سؤال‌ها، وضعیت پاسخ و کاندیدهای Wealth Diagnosis
            </p>
          </div>

          <a
            href="/"
            className="w-fit rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:border-emerald-900"
          >
            بازگشت به صفحه اصلی
          </a>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {stats.map((item) => (
    <div key={item.label} className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{item.label}</p>
      <p className="mt-2 text-3xl font-bold text-emerald-950">
        {item.value}
      </p>
      <p className="mt-2 text-xs leading-6 text-slate-500">{item.hint}</p>
    </div>
  ))}
</div>

<div className="mb-6 rounded-3xl bg-white p-4 shadow-sm">
  <div className="mb-3 flex flex-col gap-1">
    <p className="text-sm font-semibold text-emerald-950">فیلتر سؤال‌ها</p>
    <p className="text-xs text-slate-500">
      نمایش {filteredQuestions.length} سؤال از مجموع {questions.length} سؤال
    </p>
  </div>

  <div className="flex flex-wrap gap-2">
    {FILTER_OPTIONS.map((option) => {
      const isActive = option.value === activeFilter;
      const href =
        option.value === "all" ? "/admin" : `/admin?status=${option.value}`;

      return (
        <a
          key={option.value}
          href={href}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            isActive
              ? "bg-emerald-950 text-white"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          {option.label}
        </a>
      );
    })}
  </div>
</div>

        <div className="space-y-5">
          {filteredQuestions.map((q) => (
            <form
              key={q.id}
              action={updateQuestion}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <input type="hidden" name="id" value={q.id} />

              <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {new Date(q.created_at).toLocaleString("fa-IR")}
                  </p>

                  <h2 className="mt-2 text-xl font-bold leading-9 text-emerald-950">
                    {q.question_text}
                  </h2>
                </div>

                <div className="flex flex-col items-start gap-2">
  <span className="w-fit rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800">
    {translateStatus(q.status)}
  </span>

  <a
    href={`/answer/${q.id}`}
    target="_blank"
    className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:border-emerald-900"
  >
    مشاهده صفحه پاسخ
  </a>
  <CopyAnswerLink questionId={q.id} />
  <CopyUserMessage questionId={q.id} name={q.name} />
</div>
              </div>

              <div className="grid gap-4 text-sm md:grid-cols-4">
                <div>
                  <p className="text-slate-500">نام</p>
                  <p className="mt-1 font-medium">{q.name || "-"}</p>
                </div>

                <div>
                  <p className="text-slate-500">ارتباط</p>
                  <p className="mt-1 font-medium">{q.contact || "-"}</p>
                </div>

                <div>
                  <p className="text-slate-500">موضوع</p>
                  <p className="mt-1 font-medium">
                    {translateCategory(q.category)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">مبلغ / فوریت</p>
                  <p className="mt-1 font-medium">
                    {translateAmount(q.amount_range)} /{" "}
                    {translateUrgency(q.urgency)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    وضعیت سؤال
                  </label>

                  <select
                    name="status"
                    defaultValue={q.status}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-right outline-none focus:border-emerald-800"
                  >
                    <option value="new">جدید</option>
                    <option value="reviewing">در حال بررسی</option>
                    <option value="needs_more_info">
                      نیازمند اطلاعات بیشتر
                    </option>
                    <option value="answered">پاسخ داده‌شده</option>
                    <option value="sent_to_user">ارسال‌شده برای کاربر</option>
                    <option value="diagnosis_candidate">
                      کاندید Wealth Diagnosis
                    </option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <span>مناسب برای Wealth Diagnosis</span>
                    <input
                      type="checkbox"
                      name="is_wealth_diagnosis_candidate"
                      defaultChecked={q.is_wealth_diagnosis_candidate}
                      className="h-5 w-5"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  پاسخ نهایی دستی
                </label>

                <textarea
  name="final_answer"
  defaultValue={q.final_answer || buildAnswerTemplate(q)}
  placeholder="پاسخ نهایی، توضیح یا یادداشت مشاور را اینجا بنویسید..."
  className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-right leading-8 outline-none focus:border-emerald-800"
/>
              </div>

              <button
                type="submit"
                className="mt-5 rounded-2xl bg-emerald-950 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                ذخیره تغییرات
              </button>
            </form>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center text-slate-500">
             در این فیلتر، سؤالی برای نمایش وجود ندارد.
            </div>
          )}
        </div>

        <p className="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm leading-7 text-emerald-950">
  این پنل با Basic Auth محافظت می‌شود. برای استفاده عمومی، مقدارهای
  ADMIN_USERNAME و ADMIN_PASSWORD باید در محیط اجرا تنظیم شده باشند.
</p>
      </div>
    </main>
  );
}