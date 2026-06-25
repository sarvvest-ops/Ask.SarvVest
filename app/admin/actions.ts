"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function resolveFinalStatus(status: string, finalAnswer: string) {
  const autoAnswerStatuses = ["new", "reviewing", "needs_more_info"];

  if (finalAnswer && autoAnswerStatuses.includes(status)) {
    return "answered";
  }

  return status;
}

function getSafeReturnPath(value: string) {
  if (value === "/admin" || value.startsWith("/admin?")) {
    return value;
  }

  return "/admin";
}

function addSavedMessage(path: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}saved=1`;
}

export async function updateQuestion(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const status = String(formData.get("status") || "new").trim();
  const finalAnswer = String(formData.get("final_answer") || "").trim();
  const returnTo = String(formData.get("return_to") || "/admin").trim();
  const isWealthDiagnosisCandidate =
    formData.get("is_wealth_diagnosis_candidate") === "on";

  if (!id) {
    throw new Error("Question id is missing.");
  }

  const finalStatus = resolveFinalStatus(status, finalAnswer);
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("questions")
    .update({
      status: finalStatus,
      final_answer: finalAnswer || null,
      is_wealth_diagnosis_candidate: isWealthDiagnosisCandidate,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/answer/${id}`);

  const safeReturnPath = getSafeReturnPath(returnTo);
  redirect(addSavedMessage(safeReturnPath));
}
