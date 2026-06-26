import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MIN_QUESTION_LENGTH = 20;

const VALID_CATEGORIES = new Set([
  "cash",
  "gold-dollar",
  "tether",
  "fund",
  "real-estate",
  "stock",
  "asset-allocation",
]);

const VALID_GOALS = new Set(["preserve", "growth", "income", "risk-control"]);
const VALID_HORIZONS = new Set(["under-3m", "3m-12m", "over-12m"]);
const VALID_RISK_LEVELS = new Set(["low", "medium", "high"]);
const VALID_LIQUIDITY_NEEDS = new Set(["high", "medium", "low"]);
const VALID_EXPERIENCE_LEVELS = new Set(["beginner", "intermediate", "advanced"]);

const labels: Record<string, string> = {
  cash: "پول نقد",
  "gold-dollar": "طلا و دلار",
  tether: "تتر و دارایی دلاری",
  fund: "صندوق",
  "real-estate": "ملک",
  stock: "بورس",
  "asset-allocation": "ترکیب دارایی",
  "under-500m": "کمتر از ۵۰۰ میلیون تومان",
  "500m-2b": "۵۰۰ میلیون تا ۲ میلیارد تومان",
  "2b-10b": "۲ تا ۱۰ میلیارد تومان",
  "10b-50b": "۱۰ تا ۵۰ میلیارد تومان",
  "over-50b": "بیش از ۵۰ میلیارد تومان",
  immediate: "فوری",
  "one-month": "تا یک ماه آینده",
  "three-months": "تا سه ماه آینده",
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
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeEnum(value: string, validSet: Set<string>) {
  return validSet.has(value) ? value : "";
}

function getLabel(value: string) {
  return labels[value] ?? value || "نامشخص";
}

function deriveRiskProfile(input: {
  riskTolerance: string;
  timeHorizon: string;
  liquidityNeed: string;
}) {
  const { riskTolerance, timeHorizon, liquidityNeed } = input;

  if (riskTolerance === "low" || timeHorizon === "under-3m" || liquidityNeed === "high") {
    return "conservative";
  }

  if (riskTolerance === "high" && timeHorizon === "over-12m" && liquidityNeed !== "high") {
    return "aggressive";
  }

  return "balanced";
}

function deriveReviewRoute(input: {
  amountRange: string;
  urgency: string;
  category: string;
  riskProfile: string;
  currentAssets: string;
  questionText: string;
}) {
  const { amountRange, urgency, category, riskProfile, currentAssets, questionText } = input;
  const text = `${currentAssets} ${questionText}`.toLowerCase();

  const isLargeCase = amountRange === "10b-50b" || amountRange === "over-50b";
  const hasConcentrationRisk =
    text.includes("همه") ||
    text.includes("کل") ||
    text.includes("تمام") ||
    text.includes("فقط") ||
    text.includes("۱۰۰") ||
    text.includes("100");

  if (isLargeCase) return "premium_candidate";

  if (
    urgency === "immediate" ||
    category === "real-estate" ||
    category === "stock" ||
    hasConcentrationRisk ||
    riskProfile === "aggressive"
  ) {
    return "needs_human_review";
  }

  return "ai_ready";
}

function buildIpsSummary(input: {
  financialGoal: string;
  timeHorizon: string;
  riskTolerance: string;
  liquidityNeed: string;
  amountRange: string;
  investmentExperience: string;
  currentAssets: string;
  investmentConstraints: string;
  riskProfile: string;
  reviewRoute: string;
}) {
  const riskProfileLabels: Record<string, string> = {
    conservative: "محافظه‌کار",
    balanced: "متعادل",
    aggressive: "تهاجمی",
  };

  const reviewRouteLabels: Record<string, string> = {
    ai_ready: "آماده پاسخ اولیه AI",
    needs_human_review: "نیازمند بررسی انسانی",
    premium_candidate: "کاندید مشاوره تخصصی / پرمیوم",
  };

  return [
    `هدف مالی: ${getLabel(input.financialGoal)}`,
    `افق زمانی: ${getLabel(input.timeHorizon)}`,
    `ریسک‌پذیری اعلامی: ${getLabel(input.riskTolerance)}`,
    `نیاز نقدینگی: ${getLabel(input.liquidityNeed)}`,
    `حدود مبلغ تصمیم: ${getLabel(input.amountRange)}`,
    `تجربه سرمایه‌گذاری: ${getLabel(input.investmentExperience)}`,
    `ریسک‌پروفایل اولیه: ${riskProfileLabels[input.riskProfile] ?? input.riskProfile}`,
    `مسیر بررسی: ${reviewRouteLabels[input.reviewRoute] ?? input.reviewRoute}`,
    input.currentAssets ? `ترکیب دارایی فعلی: ${input.currentAssets}` : "ترکیب دارایی فعلی: ثبت نشده",
    input.investmentConstraints
      ? `محدودیت‌ها / خط قرمزها: ${input.investmentConstraints}`
      : "محدودیت‌ها / خط قرمزها: ثبت نشده",
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
    }

    const name = cleanText(body.name);
    const contact = cleanText(body.contact);
    const questionText = cleanText(body.question_text);
    const category = cleanText(body.category);
    const amountRange = cleanText(body.amount_range);
    const urgency = cleanText(body.urgency);
    const company = cleanText(body.company);

    const financialGoal = safeEnum(cleanText(body.financial_goal), VALID_GOALS);
    const timeHorizon = safeEnum(cleanText(body.time_horizon), VALID_HORIZONS);
    const riskTolerance = safeEnum(cleanText(body.risk_tolerance), VALID_RISK_LEVELS);
    const liquidityNeed = safeEnum(cleanText(body.liquidity_need), VALID_LIQUIDITY_NEEDS);
    const investmentExperience = safeEnum(
      cleanText(body.investment_experience),
      VALID_EXPERIENCE_LEVELS
    );
    const currentAssets = cleanText(body.current_assets);
    const monthlyIncome = cleanText(body.monthly_income);
    const monthlyExpense = cleanText(body.monthly_expense);
    const investmentConstraints = cleanText(body.investment_constraints);

    if (company) {
      return NextResponse.json({ success: true, message: "اطلاعات با موفقیت ثبت شد." });
    }

    if (!name) {
      return NextResponse.json({ error: "نام الزامی است." }, { status: 400 });
    }

    if (!contact || contact.length < 5) {
      return NextResponse.json(
        { error: "شماره تماس یا ایمیل معتبر الزامی است." },
        { status: 400 }
      );
    }

    if (questionText.length < MIN_QUESTION_LENGTH) {
      return NextResponse.json(
        { error: `متن سؤال باید حداقل ${MIN_QUESTION_LENGTH} کاراکتر باشد.` },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json({ error: "موضوع سؤال معتبر نیست." }, { status: 400 });
    }

    if (!financialGoal || !timeHorizon || !riskTolerance || !liquidityNeed) {
      return NextResponse.json(
        { error: "هدف مالی، افق زمانی، ریسک‌پذیری و نیاز نقدینگی الزامی هستند." },
        { status: 400 }
      );
    }

    const riskProfile = deriveRiskProfile({ riskTolerance, timeHorizon, liquidityNeed });
    const reviewRoute = deriveReviewRoute({
      amountRange,
      urgency,
      category,
      riskProfile,
      currentAssets,
      questionText,
    });
    const ipsSummary = buildIpsSummary({
      financialGoal,
      timeHorizon,
      riskTolerance,
      liquidityNeed,
      amountRange,
      investmentExperience,
      currentAssets,
      investmentConstraints,
      riskProfile,
      reviewRoute,
    });

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("questions").insert({
      name,
      contact,
      question_text: questionText,
      category,
      amount_range: amountRange || null,
      urgency: urgency || null,
      financial_goal: financialGoal,
      time_horizon: timeHorizon,
      risk_tolerance: riskTolerance,
      liquidity_need: liquidityNeed,
      current_assets: currentAssets || null,
      monthly_income: monthlyIncome || null,
      monthly_expense: monthlyExpense || null,
      investment_experience: investmentExperience || null,
      investment_constraints: investmentConstraints || null,
      ips_summary: ipsSummary,
      risk_profile: riskProfile,
      review_route: reviewRoute,
      answer_token: crypto.randomUUID(),
      status: "new",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "پروفایل مالی اولیه و سؤال شما با موفقیت ثبت شد.",
    });
  } catch {
    return NextResponse.json({ error: "خطا در ثبت اطلاعات." }, { status: 500 });
  }
}
