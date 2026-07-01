import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  // Primaire : encre/blanc en clair, s'inverse en pill claire en nuit
  // (bg-ink = clair en dark, text-bg = sombre en dark). Hover blanc en nuit.
  primary:
    "bg-ink text-bg hover:bg-[#2A2A2A] hover:-translate-y-px dark:hover:bg-white",
  secondary:
    "bg-surface text-ink border border-hairline-strong hover:bg-surface-2 hover:-translate-y-px",
  ghost: "text-ink-soft hover:bg-black/5 hover:text-ink dark:hover:bg-white/[0.06]",
  danger:
    "bg-urgent text-white hover:bg-[#B91C1C] hover:-translate-y-px dark:text-[#160404]",
};

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-[18px] py-2.5 text-sm font-semibold transition duration-150 ease-ios active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40";

// Bouton réutilisable. Si "href" est fourni, c'est un lien ; sinon un vrai bouton.
type CommonProps = { variant?: Variant; className?: string; children: ReactNode };

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
