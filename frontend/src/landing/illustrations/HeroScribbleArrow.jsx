export default function HeroScribbleArrow({ className = '', style = {}, color = '#0D9488' }) {
  return (
    <svg
      viewBox="0 0 140 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', ...style }}
      aria-hidden="true"
    >
      {/* Hand-drawn continuous single-stroke looping scribble arrow */}
      <path
        d="M12 25 C35 15, 68 18, 88 28 C108 38, 122 55, 114 70 C106 82, 85 82, 74 68 C64 54, 76 34, 100 32 C115 31, 126 42, 132 52 M120 48 L133 54 L132 40"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
