export default function MiniSquatSideIllustration({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 460 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', width: '100%', height: 'auto', ...style }}
      role="img"
      aria-label="Hand-drawn editorial illustration of a person performing a mini-squat in side view with a knee angle arc"
    >
      <defs>
        <pattern id="squat-stipple" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="#18181B" opacity="0.65" />
          <circle cx="5" cy="5" r="0.7" fill="#18181B" opacity="0.45" />
        </pattern>
        <pattern id="squat-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.8" fill="#18181B" opacity="0.35" />
        </pattern>
      </defs>

      {/* Gentle teal accent backdrop */}
      <path
        d="M90 200 C80 110, 180 70, 275 80 C370 90, 410 160, 395 260 C380 350, 280 380, 180 370 C95 360, 95 280, 90 200 Z"
        fill="#F0FDFA"
      />
      <circle cx="120" cy="110" r="14" fill="#CCFBF1" />
      <rect x="330" y="320" width="30" height="10" rx="5" fill="#99F6E4" opacity="0.65" />

      {/* Ground floor line */}
      <path d="M60 370 C160 369, 310 370, 410 370" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Side-view person doing mini-squat */}
      {/* Head facing left */}
      <path
        d="M235 90 C246 90, 256 98, 254 115 C252 130, 242 140, 230 140 C218 140, 210 130, 212 115 C214 98, 224 90, 235 90 Z"
        stroke="#18181B"
        strokeWidth="2.5"
        fill="#FFFFFF"
      />
      {/* Side profile hair */}
      <path
        d="M230 90 C242 88, 258 95, 256 114 C255 125, 248 120, 244 116 C238 110, 232 110, 226 114 C222 116, 214 122, 214 112 C214 96, 222 90, 230 90 Z"
        fill="#18181B"
        stroke="#18181B"
        strokeWidth="2"
      />
      {/* Profile nose, eye, mouth */}
      <path d="M212 115 L206 122 L212 125" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="218" cy="115" r="1.5" fill="#18181B" />
      <path d="M212 131 C215 133, 218 132, 220 131" stroke="#18181B" strokeWidth="1.6" strokeLinecap="round" />
      {/* Halftone stipple under jaw */}
      <path d="M220 132 C230 138, 242 136, 246 130 C240 138, 228 138, 220 132 Z" fill="url(#squat-dots)" />

      {/* Neck */}
      <path d="M234 140 L238 155" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M246 138 L252 153" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Torso tilted slightly forward in proper squat hinge */}
      <path
        d="M218 165 C236 156, 264 156, 276 166 L258 245 C240 248, 218 246, 206 242 Z"
        stroke="#18181B"
        strokeWidth="2.6"
        fill="#FFFFFF"
        strokeLinejoin="round"
      />
      {/* Stipple shading on torso */}
      <path
        d="M236 168 L266 172 L254 240 L226 238 Z"
        fill="url(#squat-stipple)"
        opacity="0.45"
      />

      {/* Arms reached forward for balance */}
      <path
        d="M228 168 C200 178, 172 188, 142 195"
        stroke="#18181B"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="138" cy="196" r="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />

      {/* Thigh (femur) angled back-and-down to knee */}
      {/* Hip is at (235, 245), Knee moves forward to (185, 298), Ankle is at (200, 360) */}
      <path
        d="M236 245 L182 296 L195 306 L254 250 Z"
        stroke="#18181B"
        strokeWidth="2.6"
        fill="#FFFFFF"
        strokeLinejoin="round"
      />
      {/* Stipple on underside of thigh */}
      <path d="M225 258 L190 298 L198 305 L236 262 Z" fill="url(#squat-stipple)" opacity="0.5" />

      {/* Lower leg (tibia/fibula) from knee down to ankle */}
      <path
        d="M182 296 L198 360 L212 360 L198 304 Z"
        stroke="#18181B"
        strokeWidth="2.6"
        fill="#FFFFFF"
        strokeLinejoin="round"
      />
      {/* Calf muscle stipple */}
      <path d="M196 308 L208 358 L202 358 L192 312 Z" fill="url(#squat-dots)" />

      {/* Foot / shoe planted flat on floor */}
      <path d="M172 360 L220 360 L220 370 L166 370 C165 364, 168 360, 172 360 Z" stroke="#18181B" strokeWidth="2.5" fill="#18181B" />

      {/* Background leg (subtle outline for depth) */}
      <path d="M246 250 L204 290 L214 360" stroke="#71717A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />

      {/* KNEE ANGLE ARC & MEASUREMENT */}
      {/* Skeleton dashed guide lines connecting Hip -> Knee -> Ankle */}
      <g stroke="#0D9488" strokeWidth="2" strokeDasharray="3 3">
        <line x1="238" y1="246" x2="184" y2="298" />
        <line x1="184" y1="298" x2="202" y2="360" />
      </g>
      {/* Joints landmarks */}
      <circle cx="238" cy="246" r="4.5" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" />
      <circle cx="184" cy="298" r="5" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2.2" />
      <circle cx="202" cy="360" r="4.5" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" />

      {/* Angle Arc drawn at the knee */}
      <path
        d="M198 286 A24 24 0 0 1 190 318"
        stroke="#0D9488"
        strokeWidth="2.4"
        fill="none"
      />
      {/* Angle tag bubble */}
      <rect x="135" y="302" width="40" height="20" rx="10" fill="#CCFBF1" stroke="#0D9488" strokeWidth="1.5" />
      <text x="143" y="316" fill="#0F766E" fontSize="11" fontWeight="700" fontFamily="sans-serif">135°</text>
    </svg>
  );
}
