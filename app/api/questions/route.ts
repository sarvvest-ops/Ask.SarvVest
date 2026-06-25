import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();

    const questionText = String(body.question_text || "").trim();

    if (!questionText) {
      return NextResponse.json(
        { error: "متن سؤال الزامی است." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("questions").insert({
      name: body.name || null,
      contact: body.contact || null,
      question_text: questionText,
      category: body.category || null,
      amount_range: body.amount_range || null,
      urgency: body.urgency || null,
      status: "new",
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "سؤال با موفقیت ثبت شد.",
    });
  } catch {
    return NextResponse.json(
      { error: "خطا در ثبت سؤال." },
      { status: 500 }
    );
  }
}