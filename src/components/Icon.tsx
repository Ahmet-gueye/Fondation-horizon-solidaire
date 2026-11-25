/** Jeu d'icônes en ligne (SVG), sans dépendance externe. Décoratives par défaut. */
const paths: Record<string, React.ReactNode> = {
  education: (<><path d="M2 9l10-5 10 5-10 5L2 9z" /><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /><path d="M22 9v6" /></>),
  sante: (<><path d="M12 21s-7.5-4.6-9.3-9.2C1.4 8.4 3.6 5 7 5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 16.4 12 21 12 21z" /><path d="M12 10v5M9.5 12.5h5" /></>),
  urgence: (<><path d="M12 3l9 16H3L12 3z" /><path d="M12 10v4M12 17h.01" /></>),
  solidarite: (<><circle cx="8" cy="7" r="3" /><circle cx="16" cy="7" r="3" /><path d="M2 20c0-3.3 2.7-6 6-6 1.5 0 2.9.6 4 1.5 1.1-.9 2.5-1.5 4-1.5 3.3 0 6 2.7 6 6" /></>),
  autonomie: (<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /><path d="M14 8l3-3 3 3" /></>),
  developpement: (<><path d="M12 22V11" /><path d="M12 11C12 6 8 3 3 3c0 5 4 8 9 8zM12 14c0-4 3-7 8-7 0 4-3 7-8 7z" /></>),
  eau: (<><path d="M12 3s7 7.6 7 12a7 7 0 01-14 0c0-4.4 7-12 7-12z" /><path d="M9 15a3 3 0 003 3" /></>),
  heart: (<path d="M12 21s-7.5-4.6-9.3-9.2C1.4 8.4 3.6 5 7 5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 16.4 12 21 12 21z" />),
  shield: (<><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>),
  lock: (<><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></>),
  doc: (<><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>),
  check: (<path d="M5 12.5l4.5 4.5L19 7.5" />),
  close: (<path d="M6 6l12 12M18 6L6 18" />),
  menu: (<path d="M4 7h16M4 12h16M4 17h16" />),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></>),
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
  alert: (<><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></>),
  image: (<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-8 9" /></>),
  video: (<><rect x="3" y="5" width="14" height="14" rx="2" /><path d="M17 10l4-2.5v9L17 14" /></>),
  quote: (<path d="M9 7H6a3 3 0 00-3 3v4h5v-4H6M20 7h-3a3 3 0 00-3 3v4h5v-4h-2" />),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>),
  phone: (<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />),
  pin: (<><path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6" /></>),
  handshake: (<><path d="M3 11l4-4 5 2 5-2 4 4" /><path d="M7 7l-4 4 6 6a2 2 0 003 0l5-5M12 9l-3 3a1.5 1.5 0 002 2l3-3" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>),
};

export function Icon({ name, className = "icon", title }: { name: keyof typeof paths | string; className?: string; title?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {paths[name] ?? paths.info}
    </svg>
  );
}
