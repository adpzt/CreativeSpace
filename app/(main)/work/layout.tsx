import WorkTabs from "@/components/work/WorkTabs";

// Layout de la section Work : onglets de sous-navigation au-dessus du contenu.
export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <WorkTabs />
      {children}
    </div>
  );
}
