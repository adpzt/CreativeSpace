import { redirect } from "next/navigation";

// /work renvoie directement vers la liste des clients (seule sous-section prête).
export default function WorkPage() {
  redirect("/work/clients");
}
