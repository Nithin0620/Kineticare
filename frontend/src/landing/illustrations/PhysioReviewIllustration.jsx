export default function PhysioReviewIllustration({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', width: '100%', height: 'auto', ...style }}
      role="img"
      aria-label="Hand-drawn editorial illustration of a physiotherapist reviewing movement telemetry on a laptop with a tick bubble"
    >
      <defs>
        <pattern id="physio-stipple" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="#18181B" opacity="0.65" />
          <circle cx="5" cy="5" r="0.7" fill="#18181B" opacity="0.45" />
        </pattern>
        <pattern id="physio-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.8" fill="#18181B" opacity="0.35" />
        </pattern>
      </defs>

      {/* Soft teal accent background shapes */}
      <path
        d="M75 190 C65 110, 160 70, 275 80 C390 90, 445 155, 435 250 C425 345, 320 375, 205 365 C100 355, 85 270, 75 190 Z"
        fill="#F0FDFA"
      />
      <circle cx="410" cy="115" r="14" fill="#CCFBF1" />
      <rect x="70" y="290" width="32" height="10" rx="5" fill="#99F6E4" opacity="0.65" />

      {/* Desk surface */}
      <path d="M50 315 L445 315" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 315 L66 385" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M420 315 L424 385" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Coffee mug on desk */}
      <path d="M92 315 L94 292 C94 288, 110 288, 110 292 L112 315 Z" stroke="#18181B" strokeWidth="2" fill="#FFFFFF" />
      <path d="M110 295 C116 295, 118 306, 111 308" stroke="#18181B" strokeWidth="1.8" fill="none" />

      {/* Laptop showing a recovery chart */}
      <path d="M140 315 L245 315" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      <path d="M152 315 L158 240 L238 240 L234 315" stroke="#18181B" strokeWidth="2.4" fill="#FFFFFF" strokeLinejoin="round" />
      {/* Screen area with mini bar chart */}
      <rect x="163" y="246" width="67" height="60" rx="3" fill="#F0FDFA" stroke="#18181B" strokeWidth="1.2" />
      {/* Bar chart lines */}
      <line x1="168" y1="298" x2="225" y2="298" stroke="#18181B" strokeWidth="1" />
      <rect x="172" y="278" width="6" height="20" fill="#14B8A6" rx="1" />
      <rect x="183" y="268" width="6" height="30" fill="#0D9488" rx="1" />
      <rect x="194" y="272" width="6" height="26" fill="#14B8A6" rx="1" />
      <rect x="205" y="258" width="6" height="40" fill="#0F766E" rx="1" />
      <rect x="216" y="262" width="6" height="36" fill="#2DD4BF" rx="1" />

      {/* Physiotherapist seated behind desk */}
      {/* Chair back outline */}
      <path d="M362 205 C372 205, 375 285, 372 325" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />

      {/* Head & Hair */}
      <path
        d="M312 110 C328 110, 336 122, 334 140 C332 156, 322 165, 310 165 C296 165, 290 154, 292 138 C294 122, 301 110, 312 110 Z"
        stroke="#18181B"
        strokeWidth="2.5"
        fill="#FFFFFF"
      />
      {/* Hair (tidy short cut or bun) */}
      <path
        d="M292 132 C289 116, 298 98, 315 96 C332 94, 342 106, 340 122 C338 126, 332 118, 324 116 C314 114, 304 118, 298 126 Z"
        fill="#18181B"
        stroke="#18181B"
        strokeWidth="2"
      />
      {/* Facial features: glasses, focused and warm expression */}
      <rect x="296" y="130" width="13" height="9" rx="2" stroke="#18181B" strokeWidth="1.6" fill="none" />
      <rect x="313" y="130" width="13" height="9" rx="2" stroke="#18181B" strokeWidth="1.6" fill="none" />
      <line x1="309" y1="134" x2="313" y2="134" stroke="#18181B" strokeWidth="1.6" />
      {/* Eyes through glasses */}
      <circle cx="302" cy="134" r="1.3" fill="#18181B" />
      <circle cx="320" cy="134" r="1.3" fill="#18181B" />
      <path d="M310 142 L308 147 L312 147" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M305 152 C310 156, 316 155, 318 152" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />

      {/* Halftone stipple on jaw */}
      <path d="M298 142 C302 156, 314 162, 322 160 C316 164, 304 163, 298 142 Z" fill="url(#physio-dots)" />

      {/* Neck & Clinician lab coat / scrub collar */}
      <path d="M304 165 L303 180" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M317 165 L318 180" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Torso / Lab coat with stipple shading */}
      <path
        d="M276 195 C295 186, 332 186, 350 195 L346 315 L278 315 Z"
        stroke="#18181B"
        strokeWidth="2.6"
        fill="#FFFFFF"
        strokeLinejoin="round"
      />
      {/* Clinician lapel V-neck */}
      <path d="M303 182 L312 216 L320 182" stroke="#18181B" strokeWidth="2" fill="none" />
      {/* Stethoscope around neck */}
      <path
        d="M297 190 C290 205, 292 235, 305 240 C312 242, 316 238, 316 232"
        stroke="#14B8A6"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="316" cy="232" r="3.5" fill="#0D9488" stroke="#18181B" strokeWidth="1.5" />

      {/* Stipple texture on lab coat side */}
      <path d="M325 198 L346 205 L342 305 L328 305 Z" fill="url(#physio-stipple)" opacity="0.45" />

      {/* Arms resting on desk / typing on laptop */}
      <path
        d="M276 195 C260 215, 245 250, 235 290 L242 315"
        stroke="#18181B"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Left hand on laptop keyboard */}
      <ellipse cx="238" cy="314" rx="7" ry="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />

      {/* Right arm taking notes / holding pen */}
      <path
        d="M348 198 C354 225, 345 270, 318 310"
        stroke="#18181B"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <ellipse cx="316" cy="314" rx="6" ry="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
      {/* Notepad with lines */}
      <path d="M295 315 L335 315 L330 305 L290 305 Z" stroke="#18181B" strokeWidth="1.6" fill="#FFFFFF" />

      {/* SPEECH BUBBLE WITH TICK MARK */}
      {/* Speech bubble pointing towards laptop review */}
      <path
        d="M190 120 C190 100, 255 100, 255 120 C255 136, 230 140, 222 152 C218 158, 214 164, 212 166 C213 158, 212 142, 206 140 C195 138, 190 132, 190 120 Z"
        stroke="#18181B"
        strokeWidth="2.5"
        fill="#FFFFFF"
        strokeLinejoin="round"
      />
      {/* Soft teal glow inside bubble */}
      <circle cx="222" cy="120" r="14" fill="#CCFBF1" opacity="0.7" />
      {/* Confident hand-drawn TICK mark */}
      <path
        d="M213 120 L219 127 L232 113"
        stroke="#0D9488"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
