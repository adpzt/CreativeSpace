import Sidebar from "@/components/app-shell/Sidebar";
import BottomNav from "@/components/app-shell/BottomNav";
import Header from "@/components/app-shell/Header";
import QuickNoteButton from "@/components/app-shell/QuickNoteButton";

// Layout commun a toutes les pages connectées :
// sidebar (desktop) + barre du bas (mobile) + header + bouton note rapide.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:pl-56">
      <Sidebar />
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 md:px-8 md:pb-12">
        {children}
      </main>
      <BottomNav />
      <QuickNoteButton />
    </div>
  );
}
