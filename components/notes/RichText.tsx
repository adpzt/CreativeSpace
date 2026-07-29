"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Bold, Italic, List } from "lucide-react";
import { PROJECT_COLORS } from "@/lib/work";

// ============================================================================
// ÉDITEUR DE TEXTE RICHE (v2)
// - 3 tailles de texte SEULEMENT : S (13px) / M = taille de base / L (19px).
//   M retire tout balisage de taille -> le texte revient VRAIMENT à sa taille
//   standard (l'ancien système "A+/A-" ne revenait jamais à la base).
// - La couleur du texte est derrière UN bouton (popover), plus de pastilles
//   étalées en permanence.
// - La barre d'outils n'apparaît QUE quand on édite (focus dans le texte) :
//   l'aperçu reste propre, l'édition est à un clic.
// - Plusieurs zones (ex : titre + corps d'un post-it) peuvent PARTAGER la même
//   barre via <RichTextScope> : la commande s'applique à la zone qui porte la
//   sélection.
//
// IMPORTANT : les commandes s'exécutent sur onMouseDown (avec preventDefault),
// PAS sur onClick — sinon le clic sort le focus du contentEditable et la
// sélection est perdue avant l'exécution.
// ============================================================================

type Size = "s" | "m" | "l";
const SIZE_PX: Record<Exclude<Size, "m">, string> = { s: "13px", l: "19px" };
// Taille explicite utilisée pour "M" uniquement quand la sélection est DANS une
// zone déjà agrandie/réduite (il faut bien neutraliser l'héritage).
const BASE_PX = "15px";

// ---------------------------------------------------------------------------
// Helpers DOM
// ---------------------------------------------------------------------------

function unwrapEl(el: Element) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

// Retire tout balisage de TAILLE d'un sous-arbre (spans data-fs, font[size],
// styles font-size), en dépliant les éléments devenus vides de sens.
function stripSizeMarkup(scope: Element | DocumentFragment) {
  scope.querySelectorAll("font[size]").forEach((f) => f.removeAttribute("size"));
  scope.querySelectorAll("[data-fs]").forEach((el) => el.removeAttribute("data-fs"));
  scope.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
    el.style.fontSize = "";
    if (!el.getAttribute("style")) el.removeAttribute("style");
  });
  scope.querySelectorAll("span, font").forEach((el) => {
    if (el.attributes.length === 0) unwrapEl(el);
  });
}

// Retire toute COULEUR de texte d'un sous-arbre (bouton "couleur par défaut").
function stripColorMarkup(scope: Element | DocumentFragment) {
  scope.querySelectorAll("font[color]").forEach((f) => f.removeAttribute("color"));
  scope.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
    el.style.color = "";
    if (!el.getAttribute("style")) el.removeAttribute("style");
  });
  scope.querySelectorAll("span, font").forEach((el) => {
    if (el.attributes.length === 0) unwrapEl(el);
  });
}

// Élément ancêtre qui impose une taille (span data-fs, font[size], font-size
// inline), entre `node` et `root` exclus.
function closestSized(node: Node | null, root: HTMLElement): HTMLElement | null {
  let el = node instanceof HTMLElement ? node : node?.parentElement ?? null;
  while (el && el !== root) {
    if (el.hasAttribute("data-fs") || el.matches("font[size]") || el.style.fontSize)
      return el;
    el = el.parentElement;
  }
  return null;
}

// Nettoie les éléments inline restés vides après une manipulation.
function cleanupEmptyInline(root: HTMLElement) {
  root.querySelectorAll("span, font, b, i, u, strong, em").forEach((el) => {
    if (!el.textContent && !el.querySelector("br, img")) el.remove();
  });
}

// Convertit les ANCIENS formats de taille (execCommand fontSize : <font size>
// ou span font-size en mots-clés CSS) vers le nouveau balisage data-fs.
// Appelé une fois au chargement d'une zone ; le contenu re-sauvé est propre.
function normalizeLegacySizes(root: HTMLElement) {
  root.querySelectorAll("font[size]").forEach((f) => {
    const n = parseInt(f.getAttribute("size") || "3", 10);
    const span = document.createElement("span");
    const color = f.getAttribute("color");
    if (color) span.style.color = color;
    if (n >= 4) {
      span.setAttribute("data-fs", "l");
      span.style.fontSize = SIZE_PX.l;
    } else if (n <= 2) {
      span.setAttribute("data-fs", "s");
      span.style.fontSize = SIZE_PX.s;
    }
    while (f.firstChild) span.appendChild(f.firstChild);
    f.replaceWith(span);
    if (span.attributes.length === 0) unwrapEl(span);
  });
  root.querySelectorAll<HTMLElement>("span[style*='font-size']").forEach((s) => {
    if (s.getAttribute("data-fs")) return;
    const fs = s.style.fontSize;
    if (["large", "x-large", "xx-large", "xxx-large"].includes(fs)) {
      s.setAttribute("data-fs", "l");
      s.style.fontSize = SIZE_PX.l;
    } else if (["small", "x-small", "xx-small"].includes(fs)) {
      s.setAttribute("data-fs", "s");
      s.style.fontSize = SIZE_PX.s;
    } else if (fs === "medium") {
      s.style.fontSize = "";
      if (!s.getAttribute("style")) s.removeAttribute("style");
      if (s.attributes.length === 0) unwrapEl(s);
    }
  });
}

// "rgb(25, 25, 25)" -> "#191919" (pour comparer avec la palette)
function rgbToHex(rgb: string): string | null {
  const m = rgb.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (!m) return rgb.startsWith("#") ? rgb.toLowerCase() : null;
  const h = (x: string) => parseInt(x, 10).toString(16).padStart(2, "0");
  return `#${h(m[1])}${h(m[2])}${h(m[3])}`;
}

// Applique une transformation à la sélection courante (extraction du fragment,
// mutation, réinsertion, re-sélection). Gère proprement les sélections à cheval
// sur plusieurs éléments (extractContents scinde les nœuds partiels). `mutate`
// reçoit aussi la range (déjà réduite au point d'insertion après extraction),
// utile pour inspecter les ancêtres du point d'insertion.
function transformSelection(
  root: HTMLElement,
  mutate: (frag: DocumentFragment, range: Range) => Node
) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (range.collapsed || !root.contains(range.commonAncestorContainer)) return;
  const frag = range.extractContents();
  const node = mutate(frag, range);
  const first = node instanceof DocumentFragment ? node.firstChild : node;
  const last = node instanceof DocumentFragment ? node.lastChild : node;
  range.insertNode(node);
  if (first && last) {
    const r = document.createRange();
    r.setStartBefore(first);
    r.setEndAfter(last);
    sel.removeAllRanges();
    sel.addRange(r);
  }
  cleanupEmptyInline(root);
}

// ---------------------------------------------------------------------------
// Contexte : plusieurs zones éditables partagent une même barre d'outils.
// ---------------------------------------------------------------------------

type AreaHandle = {
  el: HTMLElement;
  sync: () => void;
  // false = zone "inline" (ex : un titre) : pas de tailles ni de listes.
  allowBlocks: boolean;
};

type ScopeValue = {
  register: (h: AreaHandle) => () => void;
  areas: () => AreaHandle[];
  focused: boolean;
};

const ScopeCtx = createContext<ScopeValue | null>(null);

export function RichTextScope({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const areasRef = useRef<Set<AreaHandle>>(new Set());
  const [focused, setFocused] = useState(false);

  const register = useCallback((h: AreaHandle) => {
    areasRef.current.add(h);
    return () => {
      areasRef.current.delete(h);
    };
  }, []);
  const areas = useCallback(() => Array.from(areasRef.current), []);

  return (
    <ScopeCtx.Provider value={{ register, areas, focused }}>
      <div
        className={className}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null))
            setFocused(false);
        }}
      >
        {children}
      </div>
    </ScopeCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Barre d'outils
// ---------------------------------------------------------------------------

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  list: boolean;
  size: Size;
  color: string | null;
  allowBlocks: boolean;
};

const IDLE_STATE: ToolbarState = {
  bold: false,
  italic: false,
  list: false,
  size: "m",
  color: null,
  allowBlocks: true,
};

export function RichToolbar({ compact = false }: { compact?: boolean }) {
  // Doit être rendu dans un <RichTextScope> (le `!` fait planter sinon : usage interne)
  const { areas, focused } = useContext(ScopeCtx)!;
  const [state, setState] = useState<ToolbarState>(IDLE_STATE);
  const [colorOpen, setColorOpen] = useState(false);

  // Zone éditable qui contient la sélection courante
  const areaWithSelection = useCallback((): AreaHandle | null => {
    const sel = window.getSelection();
    const node = sel?.anchorNode ?? null;
    if (!node) return null;
    return areas().find((a) => a.el.contains(node)) ?? null;
  }, [areas]);

  // État actif (gras, taille, couleur…) recalculé à chaque changement de sélection
  useEffect(() => {
    if (!focused) {
      setColorOpen(false);
      return;
    }
    function read() {
      const area = areaWithSelection();
      if (!area) return;
      const sel = window.getSelection();
      const sized = sel?.anchorNode
        ? closestSized(sel.anchorNode, area.el)
        : null;
      const size = (sized?.getAttribute("data-fs") as Size | null) ?? "m";
      let bold = false,
        italic = false,
        list = false,
        color: string | null = null;
      try {
        bold = document.queryCommandState("bold");
        italic = document.queryCommandState("italic");
        list = document.queryCommandState("insertUnorderedList");
        color = rgbToHex(String(document.queryCommandValue("foreColor")));
      } catch {
        // queryCommand* peut jeter selon le navigateur : on garde les défauts
      }
      setState({ bold, italic, list, size, color, allowBlocks: area.allowBlocks });
    }
    read();
    document.addEventListener("selectionchange", read);
    return () => document.removeEventListener("selectionchange", read);
  }, [focused, areaWithSelection]);

  // Sauvegarde les zones modifiées (comparaison innerHTML, seule la zone
  // touchée déclenche son onChange).
  const syncAll = useCallback(() => {
    areas().forEach((a) => a.sync());
  }, [areas]);

  function execTool(fn: (area: AreaHandle) => void) {
    return (e: React.MouseEvent) => {
      e.preventDefault(); // garde le focus + la sélection dans la zone éditable
      const area = areaWithSelection();
      if (!area) return;
      fn(area);
      syncAll();
    };
  }

  const onCommand = (command: string, arg?: string, css = false) =>
    execTool(() => {
      try {
        document.execCommand("styleWithCSS", false, String(css));
      } catch {
        // non supporté : sans gravité
      }
      document.execCommand(command, false, arg);
    });

  const onSize = (size: Size) =>
    execTool((area) => {
      if (!area.allowBlocks) return;
      transformSelection(area.el, (frag, range) => {
        stripSizeMarkup(frag);
        // "M" = retour à la taille de base : on réinsère SANS balisage, sauf si
        // le point d'insertion est resté dans une zone déjà redimensionnée
        // (sélection partielle au milieu d'un grand/petit) : il faut alors une
        // taille explicite pour neutraliser l'héritage.
        const needsWrap =
          size !== "m" || !!closestSized(range.startContainer, area.el);
        if (!needsWrap) return frag;
        const span = document.createElement("span");
        span.setAttribute("data-fs", size);
        span.style.fontSize = size === "m" ? BASE_PX : SIZE_PX[size];
        span.appendChild(frag);
        return span;
      });
    });

  const onColor = (c: string) => (e: React.MouseEvent) => {
    setColorOpen(false);
    onCommand("foreColor", c, true)(e);
  };

  const onClearColor = (e: React.MouseEvent) => {
    setColorOpen(false);
    execTool((area) => {
      transformSelection(area.el, (frag) => {
        stripColorMarkup(frag);
        return frag;
      });
    })(e);
  };

  const btn = (active: boolean, disabled = false) =>
    `flex h-8 w-8 items-center justify-center rounded-[9px] transition-colors ${
      disabled
        ? "cursor-default text-black/20"
        : active
          ? "bg-ink text-white"
          : "text-ink-soft hover:bg-black/[0.06] hover:text-ink"
    }`;

  const paletteColor =
    state.color && PROJECT_COLORS.includes(state.color) ? state.color : null;
  const blocksOff = !state.allowBlocks;

  return (
    <div
      aria-hidden={!focused}
      className={`sticky top-0 z-20 transition-all duration-200 ease-ios ${
        focused
          ? "mb-2 max-h-11 opacity-100"
          : "pointer-events-none max-h-0 overflow-hidden opacity-0"
      }`}
    >
      <div className="relative inline-flex flex-wrap items-center gap-0.5 rounded-xl border border-black/[0.07] bg-white/95 p-1 shadow-chip backdrop-blur">
        <button
          type="button"
          onMouseDown={onCommand("bold")}
          aria-label="Gras"
          title="Gras"
          className={btn(state.bold)}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={onCommand("italic")}
          aria-label="Italique"
          title="Italique"
          className={btn(state.italic)}
        >
          <Italic className="h-4 w-4" />
        </button>
        {!compact && (
          <button
            type="button"
            onMouseDown={blocksOff ? (e) => e.preventDefault() : onCommand("insertUnorderedList")}
            aria-label="Liste à puces"
            title="Liste à puces"
            className={btn(state.list, blocksOff)}
          >
            <List className="h-4 w-4" />
          </button>
        )}

        {/* Tailles : S / M (base) / L — segmenté, la taille active est marquée */}
        {!compact && (
          <>
            <span className="mx-1 h-5 w-px bg-black/[0.08]" />
            <div
              className={`flex items-center rounded-[10px] bg-black/[0.05] p-0.5 ${
                blocksOff ? "opacity-40" : ""
              }`}
            >
              {(
                [
                  { key: "s" as Size, px: 11, label: "Petit" },
                  { key: "m" as Size, px: 13, label: "Normal (taille de base)" },
                  { key: "l" as Size, px: 15, label: "Grand" },
                ] as const
              ).map(({ key, px, label }) => (
                <button
                  key={key}
                  type="button"
                  onMouseDown={blocksOff ? (e) => e.preventDefault() : onSize(key)}
                  aria-label={label}
                  title={label}
                  className={`flex h-7 w-7 items-center justify-center rounded-[8px] font-bold leading-none transition-colors ${
                    state.size === key && !blocksOff
                      ? "bg-white text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                  style={{ fontSize: px }}
                >
                  A
                </button>
              ))}
            </div>
          </>
        )}

        <span className="mx-1 h-5 w-px bg-black/[0.08]" />

        {/* Couleur du texte : un seul bouton -> popover */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setColorOpen((o) => !o);
            }}
            aria-label="Couleur du texte"
            title="Couleur du texte"
            className={`flex h-8 w-8 flex-col items-center justify-center gap-[3px] rounded-[9px] transition-colors ${
              colorOpen ? "bg-black/[0.06]" : "hover:bg-black/[0.06]"
            }`}
          >
            <span
              className="text-[13px] font-bold leading-none"
              style={{ color: paletteColor ?? "#191919" }}
            >
              A
            </span>
            <span
              className="h-[3px] w-4 rounded-full"
              style={{ backgroundColor: paletteColor ?? "#191919" }}
            />
          </button>
          {colorOpen && (
            <div className="absolute right-0 top-full z-30 mt-1.5 flex items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white p-2 shadow-float">
              <button
                type="button"
                onMouseDown={onClearColor}
                aria-label="Couleur par défaut"
                title="Couleur par défaut"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] text-muted transition-colors hover:border-ink hover:text-ink ${
                  paletteColor ? "border-black/[0.15]" : "border-ink text-ink"
                }`}
              >
                /
              </button>
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={onColor(c)}
                  aria-label={`Couleur ${c}`}
                  className={`h-7 w-7 shrink-0 rounded-full transition-transform hover:scale-110 ${
                    paletteColor === c
                      ? "ring-2 ring-ink ring-offset-1"
                      : "ring-1 ring-black/10"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Zone éditable
// ---------------------------------------------------------------------------

export function RichArea({
  value,
  onChange,
  placeholder,
  className = "",
  inlineOnly = false,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  // true = zone "une ligne" (titre) : la barre désactive tailles et listes
  inlineOnly?: boolean;
}) {
  // Doit être rendu dans un <RichTextScope> (le `!` fait planter sinon : usage interne)
  const ctx = useContext(ScopeCtx)!;
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(value);
  const changeRef = useRef(onChange);
  changeRef.current = onChange;

  // Contenu initial posé une seule fois (pour ne pas casser le curseur), avec
  // conversion des anciens formats de taille.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = value || "";
    normalizeLegacySizes(el);
    last.current = el.innerHTML;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== last.current) {
      last.current = el.innerHTML;
      changeRef.current(el.innerHTML);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return ctx.register({ el, sync, allowBlocks: !inlineOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sync, inlineOnly]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={sync}
      data-ph={placeholder}
      className={`rich-content w-full outline-none empty:before:text-muted empty:before:content-[attr(data-ph)] ${className}`}
    />
  );
}

// ---------------------------------------------------------------------------
// Assemblage prêt à l'emploi (compatible avec l'ancien composant) :
// barre + zone. `compact` = petit éditeur inline (titre) : B/I/couleur.
// ---------------------------------------------------------------------------

export default function RichText({
  value,
  onChange,
  placeholder,
  compact = false,
  className = "",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <RichTextScope>
      <RichToolbar compact={compact} />
      <RichArea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inlineOnly={compact}
        className={
          compact
            ? `leading-tight ${className}`
            : `min-h-[26vh] text-[15px] leading-relaxed ${className}`
        }
      />
    </RichTextScope>
  );
}
