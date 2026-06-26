import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../../lib/adminAuth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin/questions");
  }

  const params = searchParams ? await searchParams : {};
  const hasError = params.error === "1";

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f7f3] px-5 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <a href="/" className="text-sm text-slate-500 hover:text-emerald-950">
            بازگشت به صفحه اصلی
          </a>

          <h1 className="mt-5 text-3xl font-black text-emerald-950">ورود ادمین</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            برای مشاهده سؤال‌ها و ثبت پاسخ، وارد پنل داخلی Ask SarvVest شو.
          </p>

          {hasError && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              نام کاربری یا رمز عبور درست نیست.
            </div>
          )}

          <form action="/api/admin/signin" method="post" className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700">نام کاربری</label>
              <input
                name="username"
                type="text"
                autoComplete="username"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right outline-none transition focus:border-emerald-950"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700">رمز عبور</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right outline-none transition focus:border-emerald-950"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-950 px-6 py-3 font-bold text-white transition hover:bg-emerald-900"
            >
              ورود به پنل
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
