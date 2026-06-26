import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      supabase: null,
      error:
        "Supabase environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  return {
    supabase: createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
    error: null,
  };
}

const labels: Record<string, string> = {
  cash: "پول نقد",
  "gold-dollar": "طلا و دلار",
  tether: "تتر و دارایی دلاری",
  fund: "صندوق",
  "real-estate": "ملک",
  stock: "بورس",
  "asset-allocation": "ترکیب دارایی",
  "under-500m": "کمتر از ۵۰۰ میلیون",
  "500m-2b": "۵۰۰ میلیون تا ۲ میلیارد",
  "2b-10b": "۲ تا ۱۰ میلیارد",
  "10b-50b": "۱۰ تا ۵۰ میلیارد",
  "over-50b": "بیش از ۵۰ میلیارد",
  immediate: "فوری",
  "one-month": "تا یک ماه",
  "three-months": "تا سه ماه",
  researching: "در حال بررسی",
  preserve: "حفظ ارزش پول",
  growth: "رشد سرمایه",
  income: "درآمد دوره‌ای",
  "risk-control": "کاهش ریسک",
  "under-3m": "کمتر از ۳ ماه",
  "3m-12m": "۳ تا ۱۲ ماه",
  "over-12m": "بیشتر از یک سال",
  low: "کم",
  medium: "متوسط",
  high: "زیاد",
  beginner: "تازه‌کار",
  intermediate: "متوسط",
  advanced: "حرفه‌ای",
  conservative: "محافظه‌کار",
  balanced: "متعادل",
  aggressive: "تهاجمی",
  ai_ready: "آماده پاسخ اولیه AI",
  needs_human_review: "نیازمند بررسی انسانی",
  premium_candidate: "کاندید مشاوره تخصصی / پرمیوم",
};

function label(value?: string | null) {
  if (!value) return "—";
  return labels[value] ?? value;
}

function buildPrompt(question: Record<string, string | null>) {
  return `نقش تو: دستیار تحلیل مالی SarvVest برای ساخت پیش‌نویس پاسخ اولیه هستی.

قواعد مهم:
- پاسخ قطعی خرید/فروش، وعده سود، یا نسخه نهایی سرمایه‌گذاری نده.
- جواب باید آموزشی، تحلیلی، محتاطانه و قابل ویرایش توسط مشاور انسانی باشد.
- اگر داده کافی نیست، دقیقاً بگو چه اطلاعاتی کم است.
- اگر پرونده پرریسک یا پیچیده است، صریحاً پیشنهاد بررسی انسانی بده.
- خروجی فارسی، شفاف، ساختارمند و مختصر باشد.

اطلاعات پرونده:
نام: ${question.name || "—"}
تماس: ${question.contact || "—"}
موضوع: ${label(question.category)}
حدود مبلغ: ${label(question.amount_range)}
فوریت: ${label(question.urgency)}
هدف مالی: ${label(question.financial_goal)}
افق زمانی: ${label(question.time_horizon)}
ریسک‌پذیری: ${label(question.risk_tolerance)}
نیاز نقدینگی: ${label(question.liquidity_need)}
تجربه سرمایه‌گذاری: ${label(question.investment_experience)}
ریسک‌پروفایل سیستم: ${label(question.risk_profile)}
مسیر بررسی سیستم: ${label(question.review_route)}
درآمد ماهانه: ${question.monthly_income || "—"}
هزینه ماهانه: ${question.monthly_expense || "—"}
ترکیب دارایی فعلی: ${question.current_assets || "—"}
محدودیت‌ها و خط قرمزها: ${question.investment_constraints || "—"}

IPS Summary:
${question.ips_summary || "—"}

سؤال اصلی کاربر:
${question.question_text || "—"}

خروجی را با این ساختار بده:
۱. خلاصه تصمیم
۲. نکات کلیدی وضعیت کاربر
۳. ریسک‌ها و ابهام‌های مهم
۴. پیشنهاد عملی اولیه و مرحله‌ای
۵. اطلاعات ناقص برای پاسخ دقیق‌تر
۶. آیا نیاز به بررسی انسانی دارد؟ چرا؟
۷. متن پیشنهادی نهایی برای ویرایش ادمین

در پایان یک یادآوری کوتاه بگذار که این پاسخ جایگزین مشاوره اختصاصی سرمایه‌گذاری، حقوقی یا مالیاتی نیست.`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error: clientError } = getAdminSupabase();

  if (!supabase) {
    return NextResponse.json({ error: clientError }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, prompt: buildPrompt(data) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error: clientError } = getAdminSupabase();

  if (!supabase) {
    return NextResponse.json({ error: clientError }, { status: 500 });
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const finalAnswer = cleanText(body.final_answer);
  const adminNotes = cleanText(body.admin_notes);
  const requestedStatus = cleanText(body.status) || "reviewing";

  if (!id) {
    return NextResponse.json({ error: "شناسه سؤال نامعتبر است." }, { status: 400 });
  }

  if (requestedStatus === "answered" && finalAnswer.length < 20) {
    return NextResponse.json(
      { error: "برای انتشار پاسخ، متن پاسخ باید حداقل ۲۰ کاراکتر باشد." },
      { status: 400 }
    );
  }

  const status = requestedStatus === "answered" ? "answered" : "reviewing";

  const updatePayload: Record<string, string | null> = {
    final_answer: finalAnswer || null,
    admin_notes: adminNotes || null,
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "answered") {
    updatePayload.answered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("questions")
    .update(updatePayload)
    .eq("id", id)
    .select("id, status, final_answer, admin_notes, answer_token, answered_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, question: data });
}
