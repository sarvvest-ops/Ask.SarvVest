"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function updateQuestion(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new");
  const finalAnswer = String(formData.get("final_answer") || "");
  const isWealthDiagnosisCandidate =
    formData.get("is_wealth_diagnosis_candidate") === "on";

  if (!id) {
    throw new Error("Question id is missing.");
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("questions")
    .update({
      status,
      final_answer: finalAnswer || null,
      is_wealth_diagnosis_candidate: isWealthDiagnosisCandidate,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}