export default function LivingRoomArmRaiseIllustration({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 520 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', width: '100%', height: 'auto', ...style }}
      role="img"
      aria-label="Hand-drawn editorial illustration of a person doing arm raises with camera pose tracking in front of a laptop"
    >
      <defs>
        {/* Fine stipple (halftone dot) pattern */}
        <pattern id="arm-stipple-dense" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="#18181B" opacity="0.65" />
          <circle cx="5" cy="5" r="0.8" fill="#18181B" opacity="0.5" />
        </pattern>
        <pattern id="arm-stipple-light" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.8" fill="#18181B" opacity="0.4" />
        </pattern>
      </defs>

      {/* Optional subtle teal background accent shapes */}
      <path
        d="M60 210 C70 120, 200 80, 310 95 C410 110, 470 180, 455 275 C440 370, 320 400, 195 385 C90 370, 50 300, 60 210 Z"
        fill="#F0FDFA"
      />
      <circle cx="105" cy="140" r="16" fill="#CCFBF1" />
      <rect x="390" y="310" width="36" height="12" rx="6" fill="#99F6E4" opacity="0.7" />

      {/* Living room floor line */}
      <path d="M45 375 C160 374, 340 375, 475 375" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Table with laptop */}
      {/* Table legs */}
      <path d="M95 310 L92 375" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M195 310 L198 375" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      {/* Table top */}
      <path d="M80 310 L210 310" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      {/* Small potted plant on table edge */}
      <path d="M92 310 L94 294 L106 294 L108 310 Z" stroke="#18181B" strokeWidth="2" fill="#FFFFFF" />
      <path d="M100 294 C96 282, 88 280, 88 276 C94 276, 99 284, 100 294 Z" fill="#14B8A6" stroke="#18181B" strokeWidth="1.8" />
      <path d="M100 294 C104 280, 114 278, 114 274 C108 276, 102 284, 100 294 Z" fill="#2DD4BF" stroke="#18181B" strokeWidth="1.8" />

      {/* Laptop on table */}
      <path d="M125 310 L175 310" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      {/* Laptop screen tilted back */}
      <path d="M132 310 L136 270 L176 270 L172 310" stroke="#18181B" strokeWidth="2.2" strokeLinejoin="round" fill="#FFFFFF" />
      <path d="M140 274 L170 274 L168 304 L138 304 Z" fill="#F0FDFA" stroke="#18181B" strokeWidth="1.2" strokeDasharray="2 2" />
      {/* Webcam dot on laptop */}
      <circle cx="154" cy="272" r="1.5" fill="#0D9488" />

      {/* Person standing in living room */}
      {/* Head & Hair */}
      {/* Face oval */}
      <path
        d="M320 115 C335 115, 342 128, 340 145 C338 160, 328 170, 316 170 C303 170, 296 158, 298 143 C300 126, 308 115, 320 115 Z"
        stroke="#18181B"
        strokeWidth="2.5"
        fill="#FFFFFF"
      />
      {/* Halftone stipple on jaw / cheek */}
      <path
        d="M305 142 C308 158, 322 165, 332 162 C325 168, 312 168, 305 142 Z"
        fill="url(#arm-stipple-light)"
      />
      {/* Loose hair */}
      <path
        d="M298 135 C295 120, 302 104, 318 102 C334 100, 346 110, 345 125 C345 130, 338 122, 330 120 C322 118, 312 122, 306 130 C302 135, 298 142, 298 135 Z"
        fill="#18181B"
        stroke="#18181B"
        strokeWidth="2"
      />
      {/* Facial features: calm, focused eyes and slight smile */}
      <path d="M310 138 C312 136, 315 136, 317 138" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <path d="M324 138 C326 136, 329 136, 331 138" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <path d="M320 142 L319 148 L323 148" stroke="#18181B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M315 155 C320 159, 326 158, 328 154" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />

      {/* Neck */}
      <path d="M312 170 L311 185" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M325 169 L326 185" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Torso / T-shirt with stipple shading */}
      <path
        d="M285 192 C300 186, 336 186, 352 192 L346 275 C330 278, 305 278, 292 275 Z"
        stroke="#18181B"
        strokeWidth="2.6"
        fill="#FFFFFF"
        strokeLinejoin="round"
      />
      {/* Stipple pattern on shirt */}
      <path
        d="M294 195 C308 190, 330 190, 344 195 L340 268 C326 272, 306 271, 296 267 Z"
        fill="url(#arm-stipple-dense)"
        opacity="0.4"
      />
      {/* Collar detail */}
      <path d="M311 188 C317 194, 323 194, 327 188" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

      {/* Left Arm (raised to shoulder height, extending toward laptop) */}
      <path
        d="M285 192 C265 190, 248 190, 235 194 C224 197, 212 196, 202 195"
        stroke="#18181B"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {/* Left Hand */}
      <circle cx="197" cy="195" r="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />

      {/* Right Arm (raised symmetrically to shoulder height) */}
      <path
        d="M352 192 C372 190, 395 190, 412 193 C424 195, 436 195, 444 194"
        stroke="#18181B"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {/* Right Hand */}
      <circle cx="450" cy="194" r="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />

      {/* Pants / Legs */}
      <path
        d="M292 275 L286 365 L306 365 L316 295 L324 295 L332 365 L352 365 L346 275 Z"
        stroke="#18181B"
        strokeWidth="2.6"
        fill="#FFFFFF"
        strokeLinejoin="round"
      />
      {/* Stipple shading on inner pant leg */}
      <path
        d="M314 296 L306 365 L313 365 L320 300 Z"
        fill="url(#arm-stipple-dense)"
        opacity="0.5"
      />
      {/* Shoes */}
      <path d="M282 365 C280 373, 292 375, 308 375 L308 365 Z" stroke="#18181B" strokeWidth="2.5" fill="#18181B" />
      <path d="M330 365 L330 375 C346 375, 356 373, 355 365 Z" stroke="#18181B" strokeWidth="2.5" fill="#18181B" />

      {/* MOTION TRACKING OVERLAY: thin dotted skeleton lines and circles on shoulders, elbows, wrists */}
      {/* Dotted skeleton lines */}
      <g stroke="#0D9488" strokeWidth="1.8" strokeDasharray="3 3">
        {/* Arm lines */}
        <line x1="284" y1="192" x2="238" y2="193" />
        <line x1="238" y1="193" x2="198" y2="195" />
        <line x1="352" y1="192" x2="408" y2="192" />
        <line x1="408" y1="192" x2="448" y2="194" />
        {/* Shoulder span */}
        <line x1="284" y1="192" x2="352" y2="192" />
        {/* Vision connection beam to laptop */}
        <line x1="175" y1="285" x2="198" y2="195" stroke="#14B8A6" strokeWidth="1.4" strokeDasharray="2 3" opacity="0.6" />
        <line x1="175" y1="285" x2="284" y2="192" stroke="#14B8A6" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.5" />
      </g>

      {/* Landmark target circles on joints */}
      {/* Left wrist */}
      <circle cx="198" cy="195" r="4.5" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" />
      {/* Left elbow */}
      <circle cx="238" cy="193" r="4.5" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
      {/* Left shoulder */}
      <circle cx="284" cy="192" r="5" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" />
      {/* Right shoulder */}
      <circle cx="352" cy="192" r="5" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" />
      {/* Right elbow */}
      <circle cx="408" cy="192" r="4.5" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
      {/* Right wrist */}
      <circle cx="448" cy="194" r="4.5" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" />

      {/* Tiny angle indicator arc on shoulder */}
      <path d="M284 192 M266 192 A18 18 0 0 1 278 176" stroke="#0D9488" strokeWidth="1.8" fill="none" />
      <text x="250" y="174" fill="#0F766E" fontSize="9" fontWeight="600" fontFamily="sans-serif">88°</text>
    </svg>
  );
}
