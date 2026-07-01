"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Lock } from "lucide-react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

// Bouton de soumission : affiche un état "Connexion..." pendant le traitement
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-ink py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Connexion..." : "Entrer"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white dark:bg-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink">
            <Lock className="h-5 w-5 text-bg" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Creative Space</h1>
          <p className="mt-1 text-sm text-muted">Espace privé de pztdesign</p>
        </div>

        <form action={formAction} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-xl border border-gray-200 dark:border-hairline px-4 py-3 text-sm outline-none transition-colors focus:border-ink"
          />

          {state.error && (
            <p className="text-sm text-urgent">{state.error}</p>
          )}

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
