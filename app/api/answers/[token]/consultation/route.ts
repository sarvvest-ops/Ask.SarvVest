import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isPast(value?: string | null) {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      supabase: null,
      error: "تنظیمات اتصال به دیتابیس کامل نیست.",
    };
  }

  return {
    supabase: createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
    error: null,
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
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

  const phone = cleanText(body.phone);
  const preferredTime = cleanText(body.preferred_time);

  if (!phone || phone.length < 5) {
    return NextResponse.json({ error: "شماره تماس را کامل وارد کنید." }, { status: 400 });
  }

  if (!preferredTime || preferredTime.length < 3) {
    return NextResponse.json({ error: "زمان پیشنهادی تماس را وارد کنید." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("questions")
    .select("id, status, final_answer, answer_expires_at, admin_notes")
    .eq("answer_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "لینک پاسخ معتبر نیست." }, { status: 404 });
  }

  if (data.status !== "answered" || !data.final_answer || isPast(data.answer_expires_at)) {
    return NextResponse.json(
      { error: "امکان ثبت درخواست برای این پاسخ وجود ندارد." },
      { status: 400 }
    );
  }

  const requestNote = `درخواست مشاوره تلفنی از صفحه پاسخ عمومی
تاریخ ثبت: ${new Date().toLocaleString("fa-IR")}
شماره تماس: ${phone}
زمان پیشنهادی تماس: ${preferredTime}`;

  const nextNotes = [data.admin_notes?.trim(), requestNote]
    .filter(Boolean)
    .join("\n\n---\n\n");

  const { error: updateError } = await supabase
    .from("questions")
    .update({
      admin_notes: nextNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("answer_token", token);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
