import TopNav from "@/components/app-shell/TopNav";
import BottomNav from "@/components/app-shell/BottomNav";
import PageTransition from "@/components/app-shell/PageTransition";

// Layout commun a toutes les pages connectées : nav horizontale glass (desktop),
// contenu centré (max 1040px), barre du bas (mobile).
// (Le bouton "Note" flottant a été retiré : la création se fait via les boutons
// "+ Post-it" et "+ Tâche" dans la section To do de Work.)
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-4">
      <TopNav />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-32 md:px-6 md:pb-16">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomNav />
    </div>
  );
}
