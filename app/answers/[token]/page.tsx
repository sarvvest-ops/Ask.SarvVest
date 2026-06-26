import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type PublicAnswerRow = {
  created_at?: string | null;
  name?: string | null;
  question_text?: string | null;
  category?: string | null;
  status?: string | null;
  final_answer?: string | null;
  answered_at?: string | null;
  answer_expires_at?: string | null;
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

function isPast(value?: string | null) {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}

async function getAnswer(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      answer: null as PublicAnswerRow | null,
      error: "تنظیمات اتصال به دیتابیس کامل نیست.",
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("questions")
    .select(
      "created_at, name, question_text, category, status, final_answer, answered_at, answer_expires_at"
    )
    .eq("answer_token", token)
    .single();

  if (error) {
    return { answer: null as PublicAnswerRow | null, error: error.message };
  }

  return { answer: data as PublicAnswerRow, error: null };
}

export default async function PublicAnswerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { answer, error } = await getAnswer(token);

  if (error || !answer) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#fbfbf8] px-5 py-10 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-red-50 p-7 text-red-700">
          <h1 className="text-2xl font-black">لینک پاسخ پیدا نشد</h1>
          <p className="mt-4 leading-8">
            این لینک معتبر نیست یا پاسخ موردنظر در دسترس نیست.
          </p>
        </div>
      </main>
    );
  }

  const expired = isPast(answer.answer_expires_at);
  const isReady =
    answer.status === "answered" && Boolean(answer.final_answer) && !expired;

  return (
    <main dir="rtl" className="min-h-screen bg-[#fbfbf8] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-sm font-bold text-white">
            SV
          </div>
          <h1 className="mt-5 text-3xl font-black leading-relaxed text-emerald-950 md:text-4xl">
            پاسخ Ask SarvVest
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            این پاسخ برای کمک به تصمیم‌گیری ساختارمندتر تهیه شده و سیگنال خرید و
            فروش یا وعده سود نیست.
          </p>
        </header>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="grid gap-3 text-sm md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-500">موضوع</div>
              <div className="mt-1 font-bold text-emerald-950">
                {answer.category ? categoryLabels[answer.category] ?? answer.category : "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-500">تاریخ سؤال</div>
              <div className="mt-1">{formatDate(answer.created_at)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-500">تاریخ پاسخ</div>
              <div className="mt-1">{formatDate(answer.answered_at)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-500">اعتبار تا</div>
              <div className="mt-1">{formatDate(answer.answer_expires_at)}</div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-bold text-slate-700">سؤال ثبت‌شده</div>
            <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-8 text-slate-700">
              {answer.question_text || "—"}
            </pre>
          </div>

          {expired ? (
            <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
              <div className="font-black">مهلت مشاهده این پاسخ به پایان رسیده است</div>
              <p className="mt-3 leading-8">
                پاسخ‌های Ask SarvVest از زمان انتشار به مدت ۳۰ روز قابل مشاهده
                هستند و پس از آن به‌صورت خودکار از دسترس خارج می‌شوند.
              </p>
            </div>
          ) : isReady ? (
            <div className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="text-lg font-black text-emerald-950">پاسخ نهایی</div>
              <p className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-sm leading-7 text-emerald-950">
                این پاسخ از زمان انتشار به مدت ۳۰ روز قابل مشاهده است و پس از آن
                به‌صورت خودکار حذف می‌شود.
              </p>
              <pre className="mt-4 whitespace-pre-wrap break-words font-sans text-base leading-9 text-emerald-950">
                {answer.final_answer}
              </pre>
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <div className="font-black">پاسخ هنوز آماده نیست</div>
              <p className="mt-3 leading-8">
                سؤال شما ثبت شده اما پاسخ نهایی هنوز منتشر نشده است. بعد از آماده
                شدن پاسخ، همین لینک قابل مشاهده خواهد بود.
              </p>
            </div>
          )}
        </section>

        <footer className="mt-7 text-center text-xs leading-6 text-slate-500">
          Ask SarvVest جایگزین مشاوره رسمی سرمایه‌گذاری، مالیاتی یا حقوقی نیست.
        </footer>
      </div>
    </main>
  );
}
