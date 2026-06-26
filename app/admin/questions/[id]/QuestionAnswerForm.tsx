"use client";

import { useEffect, useState } from "react";

type QuestionAnswerFormProps = {
  questionId: string;
  initialFinalAnswer?: string | null;
  initialAdminNotes?: string | null;
  initialStatus?: string | null;
  answerToken?: string | null;
};

export default function QuestionAnswerForm({
  questionId,
  initialFinalAnswer,
  initialAdminNotes,
  initialStatus,
  answerToken,
}: QuestionAnswerFormProps) {
  const [finalAnswer, setFinalAnswer] = useState(initialFinalAnswer ?? "");
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes ?? "");
  const [status, setStatus] = useState(initialStatus ?? "reviewing");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const publicAnswerPath = answerToken ? `/answers/${answerToken}` : "";
  const [publicAnswerUrl, setPublicAnswerUrl] = useState(publicAnswerPath);

  useEffect(() => {
    if (!publicAnswerPath) return;
    setPublicAnswerUrl(`${window.location.origin}${publicAnswerPath}`);
  }, [publicAnswerPath]);

  async function handleSubmit(targetStatus: string) {
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          final_answer: finalAnswer,
          admin_notes: adminNotes,
          status: targetStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(result.error || "خطا در ذخیره پاسخ.");
        return;
      }

      setStatus(targetStatus);
      setMessage(
        targetStatus === "answered"
          ? "پاسخ ذخیره شد و برای لینک عمومی آماده است."
          : "پیش‌نویس پاسخ ذخیره شد."
      );
    } catch {
      setIsError(true);
      setMessage("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!publicAnswerUrl) return;

    try {
      await navigator.clipboard.writeText(publicAnswerUrl);
      setIsError(false);
      setMessage("لینک پاسخ کپی شد.");
    } catch {
      setIsError(true);
      setMessage("کپی لینک انجام نشد. لینک را دستی کپی کن.");
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-emerald-950">نوشتن پاسخ</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            پاسخ نهایی را اینجا بنویس. وقتی آماده شد، با دکمه «انتشار پاسخ» وضعیت
            سؤال به پاسخ داده شد تغییر می‌کند.
          </p>
        </div>

        <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">
          وضعیت فعلی: {status || "—"}
        </span>
      </div>

      <label className="mt-6 block text-sm font-bold text-slate-700">پاسخ نهایی</label>
      <textarea
        value={finalAnswer}
        onChange={(event) => setFinalAnswer(event.target.value)}
        placeholder="پاسخ ساختارمند سرووست را اینجا بنویس..."
        className="mt-2 min-h-72 w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-right text-base leading-8 outline-none transition focus:border-emerald-900"
      />

      <label className="mt-5 block text-sm font-bold text-slate-700">
        یادداشت داخلی ادمین
      </label>
      <textarea
        value={adminNotes}
        onChange={(event) => setAdminNotes(event.target.value)}
        placeholder="این بخش برای خودت است و در صفحه عمومی کاربر نمایش داده نمی‌شود."
        className="mt-2 min-h-28 w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-right text-sm leading-7 outline-none transition focus:border-emerald-900"
      />

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit("reviewing")}
          className="rounded-2xl border border-emerald-950 px-6 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "در حال ذخیره..." : "ذخیره پیش‌نویس"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit("answered")}
          className="rounded-2xl bg-emerald-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "در حال ذخیره..." : "انتشار پاسخ"}
        </button>
      </div>

      {publicAnswerPath && (
        <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-7 text-emerald-950">
          <div className="font-bold">لینک عمومی پاسخ</div>
          <div className="mt-2 break-all font-mono text-xs" dir="ltr">
            {publicAnswerUrl || publicAnswerPath}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={publicAnswerPath}
              target="_blank"
              className="rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-950 shadow-sm"
            >
              باز کردن لینک
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-950 shadow-sm"
            >
              کپی لینک
            </button>
          </div>
        </div>
      )}

      {message && (
        <p
          className={`mt-5 rounded-2xl px-4 py-3 text-sm leading-7 ${
            isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-950"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
