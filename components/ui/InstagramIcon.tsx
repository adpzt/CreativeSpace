// Logo Instagram (appareil photo arrondi) avec le dégradé de marque.
// `id` doit être unique si plusieurs instances sont rendues sur la même page.
export default function InstagramIcon({
  className = "h-5 w-5",
  id = "ig-grad",
}: {
  className?: string;
  id?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <defs>
        <radialGradient id={id} cx="30%" cy="107%" r="130%">
          <stop offset="0%" stopColor="#FDD35D" />
          <stop offset="10%" stopColor="#FDD35D" />
          <stop offset="35%" stopColor="#FB543E" />
          <stop offset="60%" stopColor="#DD2A7B" />
          <stop offset="85%" stopColor="#8134AF" />
          <stop offset="100%" stopColor="#515BD4" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill={`url(#${id})`} />
      <rect
        x="5.5"
        y="5.5"
        width="13"
        height="13"
        rx="4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="16.7" cy="7.3" r="1.15" fill="#fff" />
    </svg>
  );
}
