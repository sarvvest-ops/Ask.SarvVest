export default function AdminQuestionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <form action="/api/admin/signout" method="post" className="fixed bottom-5 left-5 z-50">
        <button
          type="submit"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          خروج از پنل
        </button>
      </form>
    </>
  );
}
