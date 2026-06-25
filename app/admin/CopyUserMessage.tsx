"use client";

import { useState } from "react";

type CopyUserMessageProps = {
  questionId: string;
  name: string | null;
};

export default function CopyUserMessage({
  questionId,
  name,
}: CopyUserMessageProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/answer/${questionId}`;
    const greeting = name ? `سلام ${name}` : "سلام";

    const message = `${greeting}

پاسخ سؤال مالی شما در Ask SarvVest آماده شد.

از طریق لینک زیر می‌توانید پاسخ را مشاهده کنید:
${url}

یادآوری مهم:
این پاسخ سیگنال خرید و فروش، وعده سود یا پیش‌بینی قطعی بازار نیست. هدف Ask SarvVest کمک به تصمیم‌گیری ساختارمندتر، شناسایی ریسک‌های پنهان و مشخص کردن اطلاعات ناقص برای تصمیم بهتر است.

Ask SarvVest`;

    await navigator.clipboard.writeText(message);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-900 hover:border-amber-400"
    >
      {copied ? "متن پیام کپی شد" : "کپی پیام آماده کاربر"}
    </button>
  );
}