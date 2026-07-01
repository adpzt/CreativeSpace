import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-[#2A2A2A] hover:-translate-y-px",
  secondary:
    "bg-white text-ink border border-black/[0.12] hover:bg-[#FAFAFA] hover:-translate-y-px",
  ghost: "text-ink-soft hover:bg-black/5 hover:text-ink",
  danger: "bg-urgent text-white hover:bg-[#B91C1C] hover:-translate-y-px",
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
