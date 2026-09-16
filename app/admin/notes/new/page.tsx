import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { NewNoteForm } from "@/components/new-note-form";

export const dynamic = "force-dynamic";

export default async function NewNotePage() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return <NewNoteForm />;
}
