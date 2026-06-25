"use client";

import { useState } from "react";

export default function CopyAnswerLink({ questionId }: { questionId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/answer/${questionId}`;
    await navigator.clipboard.writeText(url);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-emerald-900"
    >
      {copied ? "لینک کپی شد" : "کپی لینک پاسخ"}
    </button>
  );
}