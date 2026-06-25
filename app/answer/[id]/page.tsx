import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Question = {
  id: string;
  created_at: string;
  name: string | null;
  question_text: string;
  status: string;
  final_answer: string | null;
  is_wealth_diagnosis_candidate: boolean;
};

function translateStatus(status: string) {
  const map: Record<string, string> = {
    new: "ثبت‌شده",
    reviewing: "در حال بررسی",
    needs_more_info: "نیازمند اطلاعات بیشتر",
    answered: "پاسخ داده‌شده",
    diagnosis_candidate: "کاندید Wealth Diagnosis",
  };

  return map[status] || status;
}

export default async function AnswerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
    .select(
      "id, created_at, name, question_text, status, final_answer, is_wealth_diagnosis_candidate"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <main dir="rtl" className="min-h-screen bg-slate-50 p-8 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-700">پاسخ پیدا نشد</h1>
          <p className="mt-4 leading-8 text-slate-600">
            لینک پاسخ معتبر نیست یا سؤال موردنظر وجود ندارد.
          </p>
        </div>
      </main>
    );
  }

  const question = data as Question;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-emerald-950">
            Ask SarvVest
          </a>

          <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
            {translateStatus(question.status)}
          </span>
        </header>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">
            تاریخ ثبت:{" "}
            {new Date(question.created_at).toLocaleDateString("fa-IR")}
          </p>

          <h1 className="mt-5 text-2xl font-bold leading-10 text-emerald-950">
            سؤال شما
          </h1>

          <p className="mt-4 rounded-2xl bg-slate-50 p-5 leading-9 text-slate-800">
            {question.question_text}
          </p>

          <div className="mt-8 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-bold text-emerald-950">
              پاسخ Ask SarvVest
            </h2>

            {question.final_answer ? (
              <div className="mt-5 whitespace-pre-line rounded-2xl border border-slate-100 bg-white p-5 leading-9 text-slate-800">
                {question.final_answer}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-amber-50 p-5 leading-8 text-amber-900">
                پاسخ شما در حال بررسی است. پس از تکمیل بررسی، پاسخ نهایی در همین
                صفحه نمایش داده می‌شود.
              </p>
            )}
          </div>

          {question.is_wealth_diagnosis_candidate && (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-lg font-bold text-emerald-950">
                پیشنهاد بررسی تخصصی Wealth Diagnosis
              </h3>

              <p className="mt-3 leading-8 text-slate-700">
                با توجه به ماهیت سؤال شما، بررسی دقیق‌تر ترکیب دارایی، نقدینگی،
                افق زمانی و ریسک‌های پنهان می‌تواند مفید باشد.
              </p>
            </div>
          )}

          <p className="mt-8 text-xs leading-6 text-slate-500">
            این پاسخ سیگنال خرید و فروش، وعده سود یا پیش‌بینی قطعی بازار نیست.
            هدف Ask SarvVest کمک به تصمیم‌گیری ساختارمندتر و شناخت ریسک‌های
            پنهان است.
          </p>
        </section>
      </div>
    </main>
  );
}