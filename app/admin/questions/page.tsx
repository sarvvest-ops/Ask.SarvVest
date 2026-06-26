import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type QuestionRow = {
  id?: string | number | null;
  created_at?: string | null;
  name?: string | null;
  contact?: string | null;
  question_text?: string | null;
  category?: string | null;
  amount_range?: string | null;
  urgency?: string | null;
  status?: string | null;
  final_answer?: string | null;
  answer_token?: string | null;
};

const categoryLabels: Record<string, string> = {
  cash: "پول نقد",
  "gold-dollar": "طلا و دلار",
  tether: "تتر و دارایی دلاری",
  fund: "صندوق",
  "real-estate": "ملک",
  stock: "بورس",
  "asset-allocation": "ترکیب دارایی",
};

const amountLabels: Record<string, string> = {
  "under-500m": "کمتر از ۵۰۰ میلیون",
  "500m-2b": "۵۰۰ میلیون تا ۲ میلیارد",
  "2b-10b": "۲ تا ۱۰ میلیارد",
  "10b-50b": "۱۰ تا ۵۰ میلیارد",
  "over-50b": "بیش از ۵۰ میلیارد",
};

const urgencyLabels: Record<string, string> = {
  immediate: "فوری",
  "one-month": "تا یک ماه",
  "three-months": "تا سه ماه",
  researching: "در حال بررسی",
};

const statusLabels: Record<string, string> = {
  new: "جدید",
  reviewing: "در حال بررسی",
  answered: "پاسخ داده شد",
  archived: "آرشیو",
};

function getLabel(map: Record<string, string>, value?: string | null) {
  if (!value) return "—";
  return map[value] ?? value;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

async function getQuestions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      questions: [] as QuestionRow[],
      error:
        "Supabase environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and a server-side SUPABASE_SERVICE_ROLE_KEY for admin reads.",
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, created_at, name, contact, question_text, category, amount_range, urgency, status, final_answer, answer_token"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { questions: [] as QuestionRow[], error: error.message };
  }

  return { questions: (data ?? []) as QuestionRow[], error: null };
}

export default async function AdminQuestionsPage() {
  const { questions, error } = await getQuestions();

  const newCount = questions.filter((question) => question.status === "new").length;
  const urgentCount = questions.filter(
    (question) => question.urgency === "immediate"
  ).length;
  const answeredCount = questions.filter(
    (question) => question.status === "answered" || Boolean(question.final_answer)
  ).length;

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f7f3] px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/" className="text-sm text-slate-500 hover:text-emerald-950">
              بازگشت به صفحه اصلی
            </a>
            <h1 className="mt-3 text-3xl font-black text-emerald-950 md:text-4xl">
              پنل سؤال‌های Ask SarvVest
            </h1>
            <p className="mt-3 max-w-2xl leading-8 text-slate-600">
              از این صفحه سؤال‌ها را می‌بینی و با دکمه «مشاهده / پاسخ» وارد
              صفحه پاسخ‌دهی هر سؤال می‌شوی.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="rounded-3xl bg-white px-5 py-4 shadow-sm">
              <div className="text-2xl font-black text-emerald-950">{questions.length}</div>
              <div className="mt-1 text-xs text-slate-500">کل سؤال‌ها</div>
            </div>
            <div className="rounded-3xl bg-white px-5 py-4 shadow-sm">
              <div className="text-2xl font-black text-emerald-950">{newCount}</div>
              <div className="mt-1 text-xs text-slate-500">جدید</div>
            </div>
            <div className="rounded-3xl bg-white px-5 py-4 shadow-sm">
              <div className="text-2xl font-black text-emerald-950">{urgentCount}</div>
              <div className="mt-1 text-xs text-slate-500">فوری</div>
            </div>
            <div className="rounded-3xl bg-white px-5 py-4 shadow-sm">
              <div className="text-2xl font-black text-emerald-950">{answeredCount}</div>
              <div className="mt-1 text-xs text-slate-500">پاسخ‌دار</div>
            </div>
          </div>
        </header>

        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
          این پنل هنوز احراز هویت ندارد. تا قبل از اضافه کردن لاگین ادمین، آن را
          فقط برای تست داخلی استفاده کن یا مسیر را عمومی منتشر نکن.
        </div>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-7 text-red-700">
            خطا در خواندن سؤال‌ها: {error}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-right text-sm">
              <thead className="bg-emerald-950 text-white">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">عملیات</th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">تاریخ</th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">کاربر</th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">تماس</th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">موضوع</th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">مبلغ</th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">فوریت</th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">وضعیت</th>
                  <th className="min-w-96 px-5 py-4 font-bold">متن سؤال</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 && !error ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-10 text-center text-slate-500">
                      هنوز سؤالی ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  questions.map((question, index) => (
                    <tr
                      key={question.id ?? index}
                      className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        {question.id ? (
                          <a
                            href={`/admin/questions/${question.id}`}
                            className="rounded-full bg-emerald-950 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900"
                          >
                            مشاهده / پاسخ
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {formatDate(question.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-bold text-emerald-950">
                        {question.name || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {question.contact || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {getLabel(categoryLabels, question.category)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {getLabel(amountLabels, question.amount_range)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {getLabel(urgencyLabels, question.urgency)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {getLabel(statusLabels, question.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 leading-7 text-slate-700">
                        <pre className="max-w-xl whitespace-pre-wrap break-words font-sans">
                          {question.question_text || "—"}
                        </pre>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
