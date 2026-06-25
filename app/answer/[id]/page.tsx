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
    sent_to_user: "ارسال‌شده برای کاربر",
    diagnosis_candidate: "کاندید Wealth Diagnosis",
  };

  return map[status] || status;
}

function getStatusTone(status: string) {
  if (status === "answered" || status === "sent_to_user") {
    return "bg-emerald-50 text-emerald-800 border-emerald-100";
  }

  if (status === "needs_more_info" || status === "diagnosis_candidate") {
    return "bg-amber-50 text-amber-900 border-amber-100";
  }

  if (status === "reviewing") {
    return "bg-sky-50 text-sky-800 border-sky-100";
  }

  return "bg-slate-50 text-slate-700 border-slate-100";
}

function getStatusDescription(status: string, hasFinalAnswer: boolean) {
  if (hasFinalAnswer) {
    return "پاسخ اولیه شما آماده شده و در همین صفحه قابل مشاهده است.";
  }

  if (status === "needs_more_info") {
    return "برای پاسخ دقیق‌تر، احتمالاً به اطلاعات تکمیلی نیاز داریم.";
  }

  if (status === "reviewing") {
    return "سؤال شما در حال بررسی است و پاسخ پس از تکمیل در همین صفحه قرار می‌گیرد.";
  }

  return "سؤال شما ثبت شده و در صف بررسی قرار دارد.";
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
      "id, created_at, name, question_text, status, final_answer, is_wealth_diagnosis_candidate",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900"
      >
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <a href="/" className="text-xl font-bold text-emerald-950">
            Ask SarvVest
          </a>

          <h1 className="mt-8 text-2xl font-bold text-red-700">
            پاسخ پیدا نشد
          </h1>

          <p className="mt-4 leading-8 text-slate-600">
            لینک پاسخ معتبر نیست یا سؤال موردنظر وجود ندارد.
          </p>

          <a
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            بازگشت به صفحه اصلی
          </a>
        </div>
      </main>
    );
  }

  const question = data as Question;
  const hasFinalAnswer = Boolean(question.final_answer?.trim());
  const statusTone = getStatusTone(question.status);
  const displayName = question.name?.trim() || "همراه گرامی";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900"
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <a href="/" className="text-2xl font-bold text-emerald-950">
            Ask SarvVest
          </a>

          <span
            className={`w-fit rounded-full border px-4 py-2 text-sm font-medium ${statusTone}`}
          >
            {translateStatus(question.status)}
          </span>
        </header>

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-emerald-950 px-8 py-8 text-white">
            <p className="text-sm text-emerald-100">
              پاسخ اختصاصی Ask SarvVest
            </p>

            <h1 className="mt-3 text-2xl font-bold leading-10">
              {displayName}، این صفحه برای پیگیری پاسخ سؤال مالی شماست.
            </h1>

            <p className="mt-3 text-sm leading-7 text-emerald-50">
              تاریخ ثبت:{" "}
              {new Date(question.created_at).toLocaleDateString("fa-IR")} |
              شناسه پیگیری: {question.id.slice(0, 8)}
            </p>
          </div>

          <div className="p-8">
            <div className={`rounded-2xl border p-5 ${statusTone}`}>
              <p className="text-sm font-semibold">
                وضعیت فعلی: {translateStatus(question.status)}
              </p>

              <p className="mt-2 text-sm leading-7">
                {getStatusDescription(question.status, hasFinalAnswer)}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-emerald-950">سؤال شما</h2>

              <p className="mt-4 rounded-2xl bg-slate-50 p-5 leading-9 text-slate-800">
                {question.question_text}
              </p>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="text-xl font-bold text-emerald-950">
                پاسخ Ask SarvVest
              </h2>

              {hasFinalAnswer ? (
                <div className="mt-5 whitespace-pre-line rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 leading-9 text-slate-800">
                  {question.final_answer}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <p className="font-semibold text-amber-900">
                    پاسخ هنوز نهایی نشده است.
                  </p>

                  <p className="mt-3 leading-8 text-amber-900">
                    پس از بررسی، پاسخ نهایی در همین صفحه قرار می‌گیرد. برای
                    دریافت پاسخ بهتر، لطفاً اطلاعات مربوط به هدف، افق زمانی،
                    نیاز نقدینگی و ترکیب فعلی دارایی خود را آماده داشته باشید.
                  </p>
                </div>
              )}
            </div>

            {question.is_wealth_diagnosis_candidate && (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-semibold text-amber-900">
                  پیشنهاد تکمیلی
                </p>

                <h3 className="mt-2 text-lg font-bold text-emerald-950">
                  این سؤال برای Wealth Diagnosis مناسب است
                </h3>

                <p className="mt-3 leading-8 text-slate-700">
                  با توجه به ماهیت سؤال شما، بررسی دقیق‌تر ترکیب دارایی،
                  نقدینگی، افق زمانی، ریسک‌پذیری و تعهدات مالی می‌تواند تصمیم را
                  بسیار دقیق‌تر و قابل دفاع‌تر کند.
                </p>
              </div>
            )}

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-bold text-emerald-950">بدون وعده سود</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  این پاسخ وعده بازدهی یا تضمین نتیجه نیست.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-bold text-emerald-950">بدون سیگنال قطعی</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  این پاسخ دستور خرید یا فروش مستقیم محسوب نمی‌شود.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-bold text-emerald-950">تصمیم ساختارمند</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  هدف، کمک به دیدن ریسک‌ها و اطلاعات ناقص تصمیم است.
                </p>
              </div>
            </div>

            <p className="mt-8 rounded-2xl bg-slate-50 p-5 text-xs leading-7 text-slate-500">
              این پاسخ جایگزین مشاوره مالی اختصاصی، بررسی کامل وضعیت دارایی،
              تعهدات، مالیات، نقدینگی و ریسک‌پذیری شما نیست. تصمیم نهایی باید با
              توجه به شرایط کامل مالی و اهداف شخصی شما گرفته شود.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
