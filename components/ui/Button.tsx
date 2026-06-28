import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-white hover:opacity-90",
  secondary: "bg-gray-100 text-ink hover:bg-gray-200",
  ghost: "text-gray-500 hover:bg-gray-50 hover:text-ink",
  danger: "text-urgent hover:bg-red-50",
};

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

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
