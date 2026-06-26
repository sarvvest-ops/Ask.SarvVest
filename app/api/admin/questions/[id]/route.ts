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
