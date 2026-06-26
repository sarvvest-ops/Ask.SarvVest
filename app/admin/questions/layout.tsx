export default function AdminQuestionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div dir="rtl" className="fixed left-5 top-5 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">admin</span>
        <form action="/api/admin/signout" method="post">
          <button
            type="submit"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            خروج
          </button>
        </form>
      </div>
      {children}
    </>
  );
}
