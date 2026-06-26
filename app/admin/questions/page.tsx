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
  answer_expires_at?: string | null;
  risk_profile?: string | null;
  review_route?: string | null;
  ips_summary?: string | null;
};

type SearchParams = Record<string, string | string[] | undefined>;
type StatusFilter =
  | "all"
  | "new"
  | "reviewing"
  | "urgent"
  | "answered"
  | "needs-review"
  | "expired"
  | "archived";

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

const riskProfileLabels: Record<string, string> = {
  conservative: "محافظه‌کار",
  balanced: "متعادل",
  aggressive: "تهاجمی",
};

const reviewRouteLabels: Record<string, string> = {
  ai_ready: "AI Ready",
  needs_human_review: "Needs Review",
  premium_candidate: "Premium",
};

function getLabel(map: Record<string, string>, value?: string | null) {
  if (!value) return "—";
  return map[value] ?? value;
}

function getSingleParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getStatusFilter(value: string): StatusFilter {
  if (
    [
      "new",
      "reviewing",
      "urgent",
      "answered",
      "needs-review",
      "expired",
      "archived",
    ].includes(value)
  ) {
    return value as StatusFilter;
  }

  return "all";
}

function buildFilterHref(filter: StatusFilter, query: string) {
  const params = new URLSearchParams();

  if (filter !== "all") params.set("status", filter);
  if (query) params.set("q", query);

  const queryString = params.toString();
  return `/admin/questions${queryString ? `?${queryString}` : ""}`;
}

function needsAdvisorReview(question: QuestionRow) {
  return (
    question.review_route === "needs_human_review" ||
    question.review_route === "premium_candidate"
  );
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

function isAnswered(question: QuestionRow) {
  return question.status === "answered" || Boolean(question.final_answer);
}

function isExpired(question: QuestionRow) {
  if (!question.answer_expires_at) return false;
  return new Date(question.answer_expires_at).getTime() < Date.now();
}

function statusBadgeClass(question: QuestionRow) {
  if (isExpired(question)) return "bg-red-50 text-red-700 ring-1 ring-red-200";
  if (isAnswered(question))
    return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
  if (question.status === "reviewing")
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function reviewRouteClass(value?: string | null) {
  if (value === "premium_candidate")
    return "bg-purple-50 text-purple-800 ring-1 ring-purple-200";
  if (value === "needs_human_review")
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  if (value === "ai_ready")
    return "bg-blue-50 text-blue-800 ring-1 ring-blue-200";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function getExpiryLabel(question: QuestionRow) {
  if (!isAnswered(question)) return "بدون پاسخ";
  if (!question.answer_expires_at) return "اعتبار نامشخص";
  if (isExpired(question)) return "منقضی شده";
  return `اعتبار تا ${formatDate(question.answer_expires_at)}`;
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
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, created_at, name, contact, question_text, category, amount_range, urgency, status, final_answer, answer_token, answer_expires_at, risk_profile, review_route, ips_summary",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { questions: [] as QuestionRow[], error: error.message };
  return { questions: (data ?? []) as QuestionRow[], error: null };
}

function filterQuestions(
  questions: QuestionRow[],
  query: string,
  statusFilter: StatusFilter,
) {
  const cleanQuery = query.trim().toLowerCase();

  return questions.filter((question) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "urgent"
          ? question.urgency === "immediate"
          : statusFilter === "answered"
            ? isAnswered(question) && !isExpired(question)
            : statusFilter === "needs-review"
              ? needsAdvisorReview(question)
              : statusFilter === "expired"
                ? isExpired(question)
                : (question.status ?? "new") === statusFilter;

    if (!matchesStatus) return false;
    if (!cleanQuery) return true;

    const searchableText = [
      question.name,
      question.contact,
      question.question_text,
      question.ips_summary,
      getLabel(categoryLabels, question.category),
      getLabel(amountLabels, question.amount_range),
      getLabel(urgencyLabels, question.urgency),
      getLabel(statusLabels, question.status),
      getLabel(riskProfileLabels, question.risk_profile),
      getLabel(reviewRouteLabels, question.review_route),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(cleanQuery);
  });
}

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = getSingleParam(resolvedSearchParams, "q").trim();
  const statusFilter = getStatusFilter(
    getSingleParam(resolvedSearchParams, "status"),
  );

  const { questions, error } = await getQuestions();
  const filteredQuestions = filterQuestions(questions, query, statusFilter);
  const newCount = questions.filter(
    (question) => question.status === "new",
  ).length;
  const reviewingCount = questions.filter(
    (question) => question.status === "reviewing",
  ).length;
  const urgentCount = questions.filter(
    (question) => question.urgency === "immediate",
  ).length;
  const answeredCount = questions.filter(
    (question) => isAnswered(question) && !isExpired(question),
  ).length;
  const expiredCount = questions.filter(isExpired).length;
  const needsReviewCount = questions.filter(needsAdvisorReview).length;

  const statCards: {
    count: number;
    label: string;
    filter: StatusFilter;
    hint: string;
  }[] = [
    {
      count: questions.length,
      label: "کل",
      filter: "all",
      hint: "همه پرونده‌ها",
    },
    { count: newCount, label: "جدید", filter: "new", hint: "هنوز بررسی نشده" },
    {
      count: reviewingCount,
      label: "در بررسی",
      filter: "reviewing",
      hint: "در حال کار",
    },
    {
      count: urgentCount,
      label: "فوری",
      filter: "urgent",
      hint: "نیازمند اولویت",
    },
    {
      count: answeredCount,
      label: "پاسخ‌دار",
      filter: "answered",
      hint: "پاسخ معتبر",
    },
    {
      count: needsReviewCount,
      label: "نیاز بررسی",
      filter: "needs-review",
      hint: "بررسی انسانی",
    },
    {
      count: expiredCount,
      label: "منقضی",
      filter: "expired",
      hint: "خارج از اعتبار",
    },
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f7f3] px-4 py-8 text-slate-900 md:px-5"
    >
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:text-emerald-950"
              >
                بازگشت به صفحه اصلی
              </a>
              <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
                admin
              </span>
              <form action="/api/admin/signout" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  خروج
                </button>
              </form>
            </div>
            <h1 className="mt-3 text-3xl font-black text-emerald-950 md:text-4xl">
              پنل Client Intake و سؤال‌ها
            </h1>
            <p className="mt-3 max-w-2xl leading-8 text-slate-600">
              اینجا دیگر فقط سؤال‌ها را نمی‌بینی؛ پروفایل اولیه، ریسک‌پروفایل و
              مسیر بررسی هم نمایش داده می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3 lg:grid-cols-7">
            {statCards.map((card) => {
              const isActive = statusFilter === card.filter;

              return (
                <a
                  key={card.label}
                  href={buildFilterHref(card.filter, query)}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-3xl px-4 py-4 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
                    isActive
                      ? "bg-emerald-950 text-white ring-emerald-950"
                      : "bg-white text-slate-700 ring-slate-200 hover:ring-emerald-200"
                  }`}
                >
                  <div
                    className={`text-3xl font-black ${
                      isActive ? "text-white" : "text-emerald-950"
                    }`}
                  >
                    {card.count}
                  </div>

                  <div
                    className={`mt-1 text-xs font-bold ${
                      isActive ? "text-emerald-50" : "text-slate-600"
                    }`}
                  >
                    {card.label}
                  </div>

                  <div
                    className={`mt-1 text-[10px] leading-5 ${
                      isActive ? "text-emerald-100" : "text-slate-400"
                    }`}
                  >
                    {card.hint}
                  </div>
                </a>
              );
            })}
          </div>
        </header>

        <form
          method="get"
          className="mt-8 grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto_auto]"
        >
          <input
            name="q"
            defaultValue={query}
            placeholder="جستجو در نام، تماس، سؤال، IPS، ریسک یا مسیر بررسی..."
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-800 focus:bg-white"
          />
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-800 focus:bg-white"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="new">جدید</option>
            <option value="reviewing">در حال بررسی</option>
            <option value="urgent">فوری</option>
            <option value="answered">پاسخ داده‌شده</option>
            <option value="needs-review">نیاز بررسی</option>
            <option value="expired">منقضی</option>
            <option value="archived">آرشیو</option>
          </select>
          <button className="rounded-2xl bg-emerald-950 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-900">
            اعمال فیلتر
          </button>
          <a
            href="/admin/questions"
            className="rounded-2xl border border-slate-200 px-6 py-3 text-center text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            پاک کردن
          </a>
        </form>

        <div className="mt-4 text-sm text-slate-500">
          نمایش {filteredQuestions.length} مورد از {questions.length} پرونده آخر
        </div>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-7 text-red-700">
            خطا در خواندن سؤال‌ها: {error}
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1060px] border-collapse text-right text-sm">
              <thead className="bg-emerald-950 text-white">
                <tr>
                  <th className="w-36 whitespace-nowrap px-5 py-4 font-bold">
                    عملیات
                  </th>
                  <th className="w-[360px] px-5 py-4 font-bold">سؤال اصلی</th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">
                    تاریخ
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">
                    کاربر
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">
                    موضوع
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">
                    مبلغ
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">
                    ریسک
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">
                    مسیر بررسی
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">
                    وضعیت / اعتبار
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.length === 0 && !error ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      موردی با این فیلتر پیدا نشد.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((question, index) => (
                    <tr
                      key={question.id ?? index}
                      className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        {question.id ? (
                          <a
                            href={`/admin/questions/${question.id}`}
                            className="rounded-full bg-emerald-950 px-4 py-2 text-center text-xs font-bold text-white hover:bg-emerald-900"
                          >
                            مشاهده / پاسخ
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 leading-7 text-slate-700">
                        <pre className="max-h-24 max-w-sm overflow-hidden whitespace-pre-wrap break-words font-sans text-sm">
                          {question.question_text || "—"}
                        </pre>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {formatDate(question.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="font-bold text-emerald-950">
                          {question.name || "—"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {question.contact || "—"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {getLabel(categoryLabels, question.category)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {getLabel(amountLabels, question.amount_range)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {getLabel(riskProfileLabels, question.risk_profile)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${reviewRouteClass(question.review_route)}`}
                        >
                          {getLabel(reviewRouteLabels, question.review_route)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(question)}`}
                          >
                            {isExpired(question)
                              ? "منقضی"
                              : isAnswered(question)
                                ? "پاسخ داده شد"
                                : getLabel(statusLabels, question.status)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {getExpiryLabel(question)}
                          </span>
                        </div>
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
