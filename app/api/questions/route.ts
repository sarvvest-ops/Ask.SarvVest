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

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
      return NextResponse.json(
        { error: "درخواست نامعتبر است." },
        { status: 400 }
      );
    }

    const name = cleanText(body.name);
    const contact = cleanText(body.contact);
    const questionText = cleanText(body.question_text);
    const category = cleanText(body.category);
    const amountRange = cleanText(body.amount_range);
    const urgency = cleanText(body.urgency);
    const company = cleanText(body.company);

    // Simple honeypot: real users never fill this hidden field.
    // Return success without writing spam into Supabase.
    if (company) {
      return NextResponse.json({
        success: true,
        message: "سؤال با موفقیت ثبت شد.",
      });
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
        {
          error: `متن سؤال باید حداقل ${MIN_QUESTION_LENGTH} کاراکتر باشد.`,
        },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { error: "موضوع سؤال معتبر نیست." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("questions").insert({
      name,
      contact,
      question_text: questionText,
      category,
      amount_range: amountRange || null,
      urgency: urgency || null,
      status: "new",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "سؤال با موفقیت ثبت شد.",
    });
  } catch {
    return NextResponse.json({ error: "خطا در ثبت سؤال." }, { status: 500 });
  }
}
