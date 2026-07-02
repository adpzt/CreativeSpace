// Logo pztdesign : l'étoile à 8 branches (Logo.svg). `color` pilote le remplissage
// (currentColor par défaut, pour hériter de la couleur du texte parent).
export default function Logo({
  className = "h-6 w-6",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 827.52 827.52" className={className} aria-hidden focusable="false">
      <polygon
        fill={color}
        points="413.76 0 474.79 266.43 706.33 121.19 561.09 352.73 827.52 413.76 561.09 474.79 706.33 706.33 474.79 561.09 413.76 827.52 352.73 561.09 121.19 706.33 266.43 474.79 0 413.76 266.43 352.73 121.19 121.19 352.73 266.43 413.76 0"
      />
    </svg>
  );
}
