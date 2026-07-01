import TopNav from "@/components/app-shell/TopNav";
import BottomNav from "@/components/app-shell/BottomNav";
import QuickNoteButton from "@/components/app-shell/QuickNoteButton";

// Layout commun a toutes les pages connectées : nav horizontale glass (desktop),
// contenu centré (max 1040px), barre du bas (mobile) + bouton note flottant.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-4">
      <TopNav />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-32 md:px-6 md:pb-16">
        {children}
      </main>
      <BottomNav />
      <QuickNoteButton />
    </div>
  );
}
