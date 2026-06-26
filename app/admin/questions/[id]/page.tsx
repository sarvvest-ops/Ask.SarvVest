import { createClient } from "@supabase/supabase-js";
import QuestionAnswerForm from "./QuestionAnswerForm";

export const dynamic = "force-dynamic";

type QuestionRow = {
  id: string | number;
  created_at?: string | null;
  name?: string | null;
  contact?: string | null;
  question_text?: string | null;
  category?: string | null;
  amount_range?: string | null;
  urgency?: string | null;
  status?: string | null;
  ai_answer?: string | null;
  final_answer?: string | null;
  admin_notes?: string | null;
  answer_token?: string | null;
  answered_at?: string | null;
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

async function getQuestion(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      question: null as QuestionRow | null,
      error:
        "Supabase environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
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
      "id, created_at, name, contact, question_text, category, amount_range, urgency, status, ai_answer, final_answer, admin_notes, answer_token, answered_at"
    )
    .eq("id", id)
    .single();

  if (error) {
    return { question: null as QuestionRow | null, error: error.message };
  }

  return { question: data as QuestionRow, error: null };
}

export default async function AdminQuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { question, error } = await getQuestion(id);

  if (error || !question) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f7f7f3] px-5 py-8 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <a href="/admin/questions" className="text-sm text-red-700 underline">
            بازگشت به پنل سؤال‌ها
          </a>
          <h1 className="mt-4 text-2xl font-black">سؤال پیدا نشد</h1>
          <p className="mt-3 leading-7">{error || "این سؤال در دیتابیس وجود ندارد."}</p>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f7f3] px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <a href="/admin/questions" className="text-sm text-slate-500 hover:text-emerald-950">
            بازگشت به پنل سؤال‌ها
          </a>
          <h1 className="mt-3 text-3xl font-black text-emerald-950 md:text-4xl">
            جزئیات سؤال و پاسخ
          </h1>
          <p className="mt-3 leading-8 text-slate-600">
            ابتدا سؤال را بخوان، پاسخ را بنویس و سپس لینک عمومی پاسخ را برای کاربر
            ارسال کن.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <h2 className="text-2xl font-black text-emerald-950">اطلاعات سؤال</h2>

            <div className="mt-5 grid gap-3 text-sm leading-7">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-500">نام</div>
                <div className="mt-1 font-bold text-emerald-950">{question.name || "—"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-500">تماس</div>
                <div className="mt-1">{question.contact || "—"}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-500">موضوع</div>
                  <div className="mt-1">{getLabel(categoryLabels, question.category)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-500">فوریت</div>
                  <div className="mt-1">{getLabel(urgencyLabels, question.urgency)}</div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-500">مبلغ</div>
                  <div className="mt-1">{getLabel(amountLabels, question.amount_range)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-500">وضعیت</div>
                  <div className="mt-1">{getLabel(statusLabels, question.status)}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-500">تاریخ ثبت</div>
                <div className="mt-1">{formatDate(question.created_at)}</div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-700">متن سؤال</div>
              <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-8 text-slate-700">
                {question.question_text || "—"}
              </pre>
            </div>

            {question.ai_answer && (
              <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-4">
                <div className="text-sm font-bold text-blue-900">پاسخ اولیه AI</div>
                <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-8 text-blue-900">
                  {question.ai_answer}
                </pre>
              </div>
            )}
          </section>

          <QuestionAnswerForm
            questionId={String(question.id)}
            initialFinalAnswer={question.final_answer}
            initialAdminNotes={question.admin_notes}
            initialStatus={question.status}
            answerToken={question.answer_token}
          />
        </div>
      </div>
    </main>
  );
}
