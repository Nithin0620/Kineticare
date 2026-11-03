export function HandDrawnIcon({ name, size = 28, className = '', color = '#18181B', accent = '#0D9488' }) {
  const icons = {
    // 1. Camera
    camera: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="3" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M7 6 L9 3 L15 3 L17 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3.5" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="12" cy="13" r="1.5" fill={accent} />
        <circle cx="17.5" cy="8.5" r="0.8" fill={color} />
      </>
    ),
    // 2. Heartbeat line
    heartbeat: (
      <>
        <path
          d="M2 12 L6 12 L8.5 6 L12 18 L15 9 L17.5 14 L19 12 L22 12"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="12" cy="18" r="1.5" fill={accent} />
      </>
    ),
    // 3. Checklist with ticks
    checklist: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="2" fill="none" />
        <path d="M7 8 L9 10 L13 6" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="14" y1="9" x2="17" y2="9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7 14 L9 16 L13 12" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="14" y1="15" x2="17" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    // 4. Chat bubble
    chat: (
      <>
        <path
          d="M4 5 C4 3.9, 5 3, 6.2 3 L17.8 3 C19 3, 20 3.9, 20 5 L20 15 C20 16.1, 19 17, 17.8 17 L8.5 17 L4 21 L4 5 Z"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="8.5" cy="10" r="1.2" fill={color} />
        <circle cx="12" cy="10" r="1.2" fill={color} />
        <circle cx="15.5" cy="10" r="1.2" fill={accent} />
      </>
    ),
    // 5. Shield
    shield: (
      <>
        <path
          d="M12 2.5 L19.5 5.5 C19.5 11.5, 17 17.5, 12 21.5 C7 17.5, 4.5 11.5, 4.5 5.5 L12 2.5 Z"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M8.5 11.5 L11 14 L15.5 9" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    // 6. Small clock
    clock: (
      <>
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
        <path d="M12 7 L12 12 L15.5 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1.5" fill={accent} />
      </>
    ),
    // 7. Target ring
    target: (
      <>
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="5" stroke={accent} strokeWidth="1.8" fill="none" />
        <circle cx="12" cy="12" r="2" fill={color} />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ verticalAlign: 'middle' }}
    >
      {icons[name] || icons.target}
    </svg>
  );
}
