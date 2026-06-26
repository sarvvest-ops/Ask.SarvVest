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
  return `نقش تو: دستیار تحلیل مالی SarvVest برای کمک به مشاور مالی هستی.

هدف:
بر اساس اطلاعات پرونده، یک تحلیل داخلی برای مشاور مالی و یک متن پیشنهادی قابل ارسال به کاربر بساز. خروجی تو پیش‌نویس است و تصمیم نهایی با مشاور مالی است.

قواعد مهم:
- پاسخ قطعی خرید/فروش، وعده سود، سیگنال معاملاتی یا نسخه نهایی سرمایه‌گذاری نده.
- درصد دقیق تخصیص دارایی نده، مگر داده کافی و محدودیت‌های روشن وجود داشته باشد؛ حتی در آن صورت هم با احتیاط و به صورت بازه یا سناریو بنویس.
- نام دارایی، صندوق، سهم، رمزارز یا محصول خاص معرفی نکن، مگر در داده‌های مجاز سرووست آمده باشد.
- اگر داده کافی نیست، فقط ۳ تا ۵ سؤال تکمیلی مهم را بپرس.
- اگر درآمد کمتر از هزینه است، نقدینگی و ذخیره اضطراری را اولویت بده.
- اگر پرونده پرریسک، مبهم، بزرگ، فوری یا دارای کسری جریان نقدی است، نیاز به بررسی انسانی را با لحن محتاط بیان کن.
- اطلاعات تماس کاربر را در خروجی تکرار نکن.
- خروجی فارسی، شفاف، ساختارمند، قابل ویرایش و بدون جمله نیمه‌تمام باشد.
- از عبارت «ادمین» استفاده نکن. در متن قابل ارسال به کاربر از عبارت «مشاور مالی شما» استفاده کن.

اطلاعات پرونده برای تحلیل داخلی:
نام کاربر: ${question.name || "—"}
موضوع: ${label(question.category)}
حدود مبلغ: ${label(question.amount_range)}
فوریت: ${label(question.urgency)}
هدف مالی: ${label(question.financial_goal)}
افق زمانی: ${label(question.time_horizon)}
ریسک‌پذیری اعلامی: ${label(question.risk_tolerance)}
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

خروجی را دقیقاً در دو بخش زیر بنویس:

بخش اول: تحلیل داخلی برای مشاور مالی SarvVest
۱. کیفیت داده‌ها: کافی / ناقص / پرابهام
۲. ریسک اصلی پرونده
۳. نکته مالی مهمی که مشاور باید به آن توجه کند
۴. آیا مسیر بررسی سیستم را تأیید می‌کنی یا تغییر می‌دهی؟ دلیل کوتاه بنویس.
۵. آیا پرونده نیازمند بررسی انسانی یا مناسب مشاوره تخصصی است؟ چرا؟
۶. فقط ۳ تا ۵ سؤال تکمیلی ضروری که قبل از پاسخ نهایی باید پرسیده شود.

بخش دوم: متن پیشنهادی قابل ارسال به کاربر
- این بخش باید برای کاربر قابل فهم، محترمانه، کوتاه و قابل ارسال باشد.
- حداکثر ۴ تا ۶ پاراگراف بنویس.
- به جای اصطلاحات داخلی مثل AI Ready، Needs Review یا Premium از زبان ساده استفاده کن.
- اگر بررسی انسانی لازم است، بنویس: «بهتر است قبل از تصمیم نهایی، جزئیات توسط مشاور مالی شما بررسی شود.»
- در پایان بنویس: «این پاسخ جایگزین مشاوره اختصاصی سرمایه‌گذاری، حقوقی یا مالیاتی نیست و بر اساس اطلاعات ثبت‌شده تهیه شده است.»`;
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
