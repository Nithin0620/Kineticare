import { useMemo } from 'react';
import { MOVENET_KEYPOINTS, MOVENET_CONNECTIONS } from './poseConstants.js';

export default function InteractivePoseFigure({
  view = 'front', // 'front' | 'side' | 'toe-touch' | 'heel-raise'
  amount = 0, // In degrees (0 to 120)
  layerMode = 'both', // 'sketch' | 'skeleton' | 'both'
  pointMode = '17', // '17' | 'derived' | '33'
  lostTracking = false,
  selectedPoint = null,
  onSelectPoint = () => {},
  exercise = null,
}) {
  const activeMode = exercise || view;
  const isFront = activeMode === 'front' || activeMode === 'arm';
  const isToeTouch = activeMode === 'toe-touch';
  const isHeelRaise = activeMode === 'heel-raise';

  // Articulated Forward Kinematics Model
  // Single source of truth for both the illustrated character and the landmark skeleton overlay
  const poseData = useMemo(() => {
    if (isFront) {
      // Front View: Bilateral Side Arm Raise
      // amount is shoulder elevation in degrees (0 = arms down at 0°, 90 = shoulder level, 120 = high raise)
      const rad = (amount * Math.PI) / 180;
      
      const headCenter = { x: 200, y: 92 };
      const nose = { x: 200, y: 98 };
      const leftEye = { x: 191, y: 90 };
      const rightEye = { x: 209, y: 90 };
      const leftEar = { x: 178, y: 94 };
      const rightEar = { x: 222, y: 94 };

      const leftShoulder = { x: 154, y: 180 };
      const rightShoulder = { x: 246, y: 180 };

      // Arm elevation kinematics: from straight down (angle = PI/2) outwards & upwards
      const armLengthUpper = 68;
      const armLengthLower = 62;

      const leftElbow = {
        x: leftShoulder.x - Math.sin(rad) * armLengthUpper,
        y: leftShoulder.y + Math.cos(rad) * armLengthUpper,
      };
      const leftWrist = {
        x: leftElbow.x - Math.sin(rad) * armLengthLower,
        y: leftElbow.y + Math.cos(rad) * armLengthLower,
      };

      const rightElbow = {
        x: rightShoulder.x + Math.sin(rad) * armLengthUpper,
        y: rightShoulder.y + Math.cos(rad) * armLengthUpper,
      };
      const rightWrist = {
        x: rightElbow.x + Math.sin(rad) * armLengthLower,
        y: rightElbow.y + Math.cos(rad) * armLengthLower,
      };

      const leftHip = { x: 172, y: 310 };
      const rightHip = { x: 228, y: 310 };

      const leftKnee = { x: 172, y: 410 };
      const rightKnee = { x: 228, y: 410 };

      const leftAnkle = { x: 172, y: 505 };
      const rightAnkle = { x: 228, y: 505 };

      const keypoints17 = [
        nose, leftEye, rightEye, leftEar, rightEar,
        leftShoulder, rightShoulder, leftElbow, rightElbow,
        leftWrist, rightWrist, leftHip, rightHip,
        leftKnee, rightKnee, leftAnkle, rightAnkle,
      ];

      // Derived points (midpoints)
      const shoulderMid = { x: 200, y: 180 };
      const hipMid = { x: 200, y: 310 };
      const torsoCenter = { x: 200, y: 245 };

      return {
        keypoints: keypoints17,
        headCenter,
        shoulderMid,
        hipMid,
        torsoCenter,
        leftElbow,
        leftWrist,
        rightElbow,
        rightWrist,
      };
    } else if (isToeTouch) {
      // Side View: Standing Toe Touch (Posterior chain / hip hinge forward bend)
      const bend = Math.min(80, Math.max(0, amount));
      const bendRad = (bend * Math.PI) / 180;

      // Hips shift backward to counterbalance torso leaning forward
      const hipShiftX = Math.sin(bendRad) * 24;
      const hip = { x: 230 + hipShiftX, y: 285 };
      const knee = { x: 200, y: 400 };
      const ankle = { x: 195, y: 495 };

      // Torso hinges forward from hips
      const torsoLength = 115;
      const shoulder = {
        x: hip.x - Math.sin(bendRad) * torsoLength,
        y: hip.y - Math.cos(bendRad) * torsoLength,
      };

      const neckLength = 30;
      const headCenter = {
        x: shoulder.x - Math.sin(bendRad) * neckLength - 10,
        y: shoulder.y - Math.cos(bendRad) * neckLength - 16,
      };

      const nose = { x: headCenter.x - 16, y: headCenter.y + 4 };
      const leftEye = { x: headCenter.x - 8, y: headCenter.y - 4 };
      const rightEye = { x: headCenter.x - 4, y: headCenter.y - 4 };
      const leftEar = { x: headCenter.x + 8, y: headCenter.y };
      const rightEar = { x: headCenter.x + 12, y: headCenter.y };

      // Arms reach down towards toes/ankles
      const reachProgress = bend / 80;
      const wrist = {
        x: shoulder.x + 10,
        y: shoulder.y + 70 + reachProgress * 30,
      };
      const elbow = {
        x: (shoulder.x + wrist.x) / 2 - 4,
        y: (shoulder.y + wrist.y) / 2,
      };

      const keypoints17 = [
        nose, leftEye, rightEye, leftEar, rightEar,
        shoulder, { x: shoulder.x + 6, y: shoulder.y },
        elbow, { x: elbow.x + 6, y: elbow.y },
        wrist, { x: wrist.x + 6, y: wrist.y },
        hip, { x: hip.x + 8, y: hip.y },
        knee, { x: knee.x + 8, y: knee.y },
        ankle, { x: ankle.x + 8, y: ankle.y },
      ];

      return {
        keypoints: keypoints17,
        headCenter,
        shoulderMid: shoulder,
        hipMid: hip,
        torsoCenter: { x: (shoulder.x + hip.x) / 2, y: (shoulder.y + hip.y) / 2 },
      };
    } else if (isHeelRaise) {
      // Side View: Standing Heel Raise (Plantarflexion / calf extension)
      const lift = Math.min(30, Math.max(0, amount));
      const liftY = lift * 1.3;

      const ankle = { x: 195, y: 495 - liftY };
      const knee = { x: 195, y: 395 - liftY };
      const hip = { x: 205, y: 280 - liftY };
      const shoulder = { x: 205, y: 165 - liftY };

      const headCenter = { x: 200, y: 92 - liftY };
      const nose = { x: headCenter.x - 18, y: headCenter.y + 4 };
      const leftEye = { x: headCenter.x - 10, y: headCenter.y - 4 };
      const rightEye = { x: headCenter.x - 6, y: headCenter.y - 4 };
      const leftEar = { x: headCenter.x + 8, y: headCenter.y };
      const rightEar = { x: headCenter.x + 12, y: headCenter.y };

      const elbow = { x: shoulder.x - 8, y: shoulder.y + 60 };
      const wrist = { x: shoulder.x - 10, y: shoulder.y + 115 };

      const keypoints17 = [
        nose, leftEye, rightEye, leftEar, rightEar,
        shoulder, { x: shoulder.x + 6, y: shoulder.y },
        elbow, { x: elbow.x + 6, y: elbow.y },
        wrist, { x: wrist.x + 6, y: wrist.y },
        hip, { x: hip.x + 8, y: hip.y },
        knee, { x: knee.x + 8, y: knee.y },
        ankle, { x: ankle.x + 8, y: ankle.y },
      ];

      return {
        keypoints: keypoints17,
        headCenter,
        shoulderMid: shoulder,
        hipMid: hip,
        torsoCenter: { x: (shoulder.x + hip.x) / 2, y: (shoulder.y + hip.y) / 2 },
      };
    } else {
      // Side View: Mini-Squat Kinematics
      // amount is knee flexion angle in degrees (e.g. 0° rest knee at 170°, up to 45° flexion -> knee at 125°)
      const flexion = Math.min(60, Math.max(0, amount * 0.45)); // progressive knee flexion
      const flexionRad = (flexion * Math.PI) / 180;

      // Hips drop and push back slightly as knees bend
      const hipDropY = Math.sin(flexionRad) * 48;
      const hipShiftX = Math.sin(flexionRad) * 32;

      const hip = { x: 220 + hipShiftX, y: 280 + hipDropY };
      const knee = { x: 185 - Math.sin(flexionRad) * 12, y: 395 + hipDropY * 0.3 };
      const ankle = { x: 195, y: 495 };

      // Torso hinges forward slightly to maintain center of mass
      const torsoLeanRad = flexionRad * 0.65;
      const torsoLength = 115;
      const shoulder = {
        x: hip.x - Math.sin(torsoLeanRad) * torsoLength,
        y: hip.y - Math.cos(torsoLeanRad) * torsoLength,
      };

      const neckLength = 32;
      const headCenter = {
        x: shoulder.x - Math.sin(torsoLeanRad) * neckLength - 10,
        y: shoulder.y - Math.cos(torsoLeanRad) * neckLength - 20,
      };

      const nose = { x: headCenter.x - 18, y: headCenter.y + 4 };
      const leftEye = { x: headCenter.x - 10, y: headCenter.y - 4 };
      const rightEye = { x: headCenter.x - 6, y: headCenter.y - 4 };
      const leftEar = { x: headCenter.x + 8, y: headCenter.y };
      const rightEar = { x: headCenter.x + 12, y: headCenter.y };

      // Arms reached forward for counterbalance
      const armReach = 65 + flexion * 0.4;
      const elbow = { x: shoulder.x - armReach * 0.55, y: shoulder.y + 20 };
      const wrist = { x: shoulder.x - armReach, y: shoulder.y + 12 };

      // For side view, left and right keypoints align closely
      const keypoints17 = [
        nose, leftEye, rightEye, leftEar, rightEar,
        shoulder, { x: shoulder.x + 6, y: shoulder.y }, // left/right shoulder
        elbow, { x: elbow.x + 6, y: elbow.y }, // left/right elbow
        wrist, { x: wrist.x + 6, y: wrist.y }, // left/right wrist
        hip, { x: hip.x + 8, y: hip.y }, // left/right hip
        knee, { x: knee.x + 8, y: knee.y }, // left/right knee
        ankle, { x: ankle.x + 8, y: ankle.y }, // left/right ankle
      ];

      return {
        keypoints: keypoints17,
        headCenter,
        shoulderMid: shoulder,
        hipMid: hip,
        torsoCenter: { x: (shoulder.x + hip.x) / 2, y: (shoulder.y + hip.y) / 2 },
        kneeAngle: Math.round(175 - flexion * 1.1),
      };
    }
  }, [isFront, isToeTouch, isHeelRaise, amount]);

  const pts = poseData.keypoints;
  const showSketch = layerMode === 'sketch' || layerMode === 'both';
  const showSkeleton = layerMode === 'skeleton' || layerMode === 'both';

  return (
    <div
      className="pose-figure-stage"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '260px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg
        viewBox="0 0 400 540"
        width="100%"
        height="100%"
        style={{
          width: '100%',
          height: '100%',
          maxHeight: '440px',
          maxWidth: '380px',
          display: 'block',
          margin: '0 auto',
        }}
        className={`pose-interactive-svg ${lostTracking ? 'tracking-lost' : ''}`}
        role="img"
        aria-label={`${isFront ? 'Front' : 'Side'} view articulated posture figure with MoveNet landmark overlay`}
      >
        <defs>
          <pattern id="pose-fig-stipple" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.85" fill="#18181B" opacity="0.45" />
            <circle cx="5" cy="5" r="0.65" fill="#18181B" opacity="0.3" />
          </pattern>
        </defs>

        {/* 1. CHARACTER ARTWORK (Connected directly to kinematics joints) */}
        {showSketch && (
          <g className="figure-artwork">
            {/* Soft floor shadow */}
            <ellipse cx="200" cy="518" rx="85" ry="9" fill="#E4E4E7" opacity="0.6" />

            {isFront ? (
              // FRONT VIEW CHARACTER
              <g>
                {/* Torso & Clothes */}
                <path
                  d={`M${pts[5].x} ${pts[5].y} L${pts[6].x} ${pts[6].y} L${pts[12].x + 4} ${pts[12].y} L${pts[11].x - 4} ${pts[11].y} Z`}
                  fill="#FFFFFF"
                  stroke="#18181B"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
                {/* Torso stipple shading */}
                <path
                  d={`M${pts[5].x + 6} ${pts[5].y + 6} L${pts[6].x - 6} ${pts[6].y + 6} L${pts[12].x} ${pts[12].y - 4} L${pts[11].x} ${pts[11].y - 4} Z`}
                  fill="url(#pose-fig-stipple)"
                  opacity="0.6"
                />

                {/* Pants & Legs */}
                {/* Left Leg */}
                <path
                  d={`M${pts[11].x - 4} ${pts[11].y} L${pts[13].x - 6} ${pts[13].y} L${pts[15].x - 8} ${pts[15].y} L${pts[15].x + 6} ${pts[15].y} L${pts[13].x + 4} ${pts[13].y} L196 ${pts[11].y + 25} Z`}
                  fill="#FFFFFF"
                  stroke="#18181B"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                {/* Right Leg */}
                <path
                  d={`M${pts[12].x + 4} ${pts[12].y} L${pts[14].x + 6} ${pts[14].y} L${pts[16].x + 8} ${pts[16].y} L${pts[16].x - 6} ${pts[16].y} L${pts[14].x - 4} ${pts[14].y} L204 ${pts[11].y + 25} Z`}
                  fill="#FFFFFF"
                  stroke="#18181B"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                {/* Shoes */}
                <rect x={pts[15].x - 14} y={pts[15].y} width="22" height="10" rx="4" fill="#18181B" />
                <rect x={pts[16].x - 8} y={pts[16].y} width="22" height="10" rx="4" fill="#18181B" />

                {/* Articulated Left Arm (Shoulder -> Elbow -> Wrist) */}
                <path
                  d={`M${pts[5].x} ${pts[5].y} L${pts[7].x} ${pts[7].y} L${pts[9].x} ${pts[9].y}`}
                  stroke="#18181B"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx={pts[9].x} cy={pts[9].y} r="6" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />

                {/* Articulated Right Arm (Shoulder -> Elbow -> Wrist) */}
                <path
                  d={`M${pts[6].x} ${pts[6].y} L${pts[8].x} ${pts[8].y} L${pts[10].x} ${pts[10].y}`}
                  stroke="#18181B"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx={pts[10].x} cy={pts[10].y} r="6" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />

                {/* Neck & Head */}
                <line x1="200" y1="135" x2="200" y2="180" stroke="#18181B" strokeWidth="8" strokeLinecap="round" />
                {/* Head Oval */}
                <ellipse cx={poseData.headCenter.x} cy={poseData.headCenter.y} rx="24" ry="32" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.6" />
                {/* Stipple shading on cheek */}
                <path d="M188 98 C192 115, 206 122, 218 116 C208 124, 192 122, 188 98 Z" fill="url(#pose-fig-stipple)" />
                {/* Hair */}
                <path d="M176 90 C176 68, 224 68, 224 90 C216 80, 204 78, 196 78 C188 78, 180 82, 176 90 Z" fill="#18181B" />
                {/* Facial Features */}
                <circle cx={pts[1].x} cy={pts[1].y} r="1.5" fill="#18181B" />
                <circle cx={pts[2].x} cy={pts[2].y} r="1.5" fill="#18181B" />
                <path d="M198 97 L200 103 L203 103" stroke="#18181B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M194 112 C198 116, 202 116, 206 112" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            ) : (
              // SIDE VIEW CHARACTER (Mini-squat)
              <g>
                {/* Torso */}
                <path
                  d={`M${pts[5].x - 14} ${pts[5].y} L${pts[5].x + 14} ${pts[5].y} L${pts[11].x + 14} ${pts[11].y} L${pts[11].x - 14} ${pts[11].y} Z`}
                  fill="#FFFFFF"
                  stroke="#18181B"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
                <path
                  d={`M${pts[5].x} ${pts[5].y + 4} L${pts[5].x + 10} ${pts[5].y + 4} L${pts[11].x + 10} ${pts[11].y - 4} L${pts[11].x} ${pts[11].y - 4} Z`}
                  fill="url(#pose-fig-stipple)"
                  opacity="0.6"
                />

                {/* Arms reaching forward for counterbalance */}
                <path
                  d={`M${pts[5].x} ${pts[5].y} L${pts[7].x} ${pts[7].y} L${pts[9].x} ${pts[9].y}`}
                  stroke="#18181B"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx={pts[9].x} cy={pts[9].y} r="5.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />

                {/* Thigh (Hip -> Knee) */}
                <path
                  d={`M${pts[11].x - 14} ${pts[11].y} L${pts[13].x - 12} ${pts[13].y} L${pts[13].x + 12} ${pts[13].y} L${pts[11].x + 14} ${pts[11].y} Z`}
                  fill="#FFFFFF"
                  stroke="#18181B"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                {/* Lower Leg (Knee -> Ankle) */}
                <path
                  d={`M${pts[13].x - 12} ${pts[13].y} L${pts[15].x - 10} ${pts[15].y} L${pts[15].x + 10} ${pts[15].y} L${pts[13].x + 12} ${pts[13].y} Z`}
                  fill="#FFFFFF"
                  stroke="#18181B"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                {/* Planted Foot */}
                <rect x={pts[15].x - 22} y={pts[15].y} width="36" height="11" rx="4" fill="#18181B" />

                {/* Head in profile */}
                <ellipse cx={poseData.headCenter.x} cy={poseData.headCenter.y} rx="22" ry="28" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.6" />
                <path d={`M${poseData.headCenter.x - 22} ${poseData.headCenter.y + 4} L${poseData.headCenter.x - 28} ${poseData.headCenter.y + 10} L${poseData.headCenter.x - 22} ${poseData.headCenter.y + 12}`} stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={poseData.headCenter.x - 12} cy={poseData.headCenter.y - 2} r="1.5" fill="#18181B" />
              </g>
            )}
          </g>
        )}

        {/* 2. SKELETON & KEYPOINTS OVERLAY */}
        {showSkeleton && (
          <g className={`pose-overlay-group ${lostTracking ? 'overlay-lost' : ''}`}>
            {/* Skeletal connection lines */}
            {MOVENET_CONNECTIONS.map(([a, b]) => {
              const pA = pts[a];
              const pB = pts[b];
              return (
                <line
                  key={`${a}-${b}`}
                  x1={pA.x}
                  y1={pA.y}
                  x2={pB.x}
                  y2={pB.y}
                  stroke={lostTracking ? '#DC2626' : a >= 5 && a % 2 === 1 ? '#0D9488' : '#0284C7'}
                  strokeWidth={lostTracking ? '2' : '2.8'}
                  strokeDasharray={lostTracking ? '4 4' : 'none'}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Derived Landmarks (Hollow circles for body axes) */}
            {pointMode === 'derived' && (
              <g className="derived-landmarks">
                <circle cx={poseData.shoulderMid.x} cy={poseData.shoulderMid.y} r="7" fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="2 2" />
                <circle cx={poseData.hipMid.x} cy={poseData.hipMid.y} r="7" fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="2 2" />
                <circle cx={poseData.torsoCenter.x} cy={poseData.torsoCenter.y} r="6" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.8" />
                <line x1={poseData.shoulderMid.x} y1={poseData.shoulderMid.y} x2={poseData.hipMid.x} y2={poseData.hipMid.y} stroke="#6366F1" strokeWidth="1.6" strokeDasharray="3 3" />
              </g>
            )}

            {/* 33-point Comparison view: Illustrative BlazePose landmarks (hands, feet, face detail) */}
            {pointMode === '33' && (
              <g className="comparison-landmarks">
                {/* Additional face landmarks (mouth, inner/outer eyes) */}
                <circle cx="195" cy="113" r="2.2" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1.4" />
                <circle cx="205" cy="113" r="2.2" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1.4" />
                {/* Left hand details (thumb, index, pinky) */}
                <circle cx={pts[9].x - 4} cy={pts[9].y + 4} r="2.2" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1.4" />
                <circle cx={pts[9].x - 6} cy={pts[9].y - 2} r="2.2" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1.4" />
                {/* Right hand details */}
                <circle cx={pts[10].x + 4} cy={pts[10].y + 4} r="2.2" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1.4" />
                <circle cx={pts[10].x + 6} cy={pts[10].y - 2} r="2.2" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1.4" />
                {/* Feet details (heels, toes) */}
                <circle cx={pts[15].x - 8} cy={pts[15].y + 6} r="2.2" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1.4" />
                <circle cx={pts[16].x + 8} cy={pts[16].y + 6} r="2.2" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1.4" />
              </g>
            )}

            {/* Interactive MoveNet Keypoint circles */}
            {pts.map((p, i) => {
              const isSelected = selectedPoint === i;
              const isArmOrLeg = i >= 5;
              const isLeft = i % 2 === 1;
              const pointColor = isArmOrLeg ? (isLeft ? '#0D9488' : '#0284C7') : '#64748B';

              return (
                <g key={i} className="keypoint-marker" onClick={() => onSelectPoint(i)}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 8 : 5.5}
                    fill={isSelected ? '#FEF08A' : '#FFFFFF'}
                    stroke={lostTracking ? '#DC2626' : pointColor}
                    strokeWidth={isSelected ? 3 : 2.2}
                    role="button"
                    tabIndex={0}
                    aria-label={`${MOVENET_KEYPOINTS[i]} keypoint (MoveNet index ${i})`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectPoint(i);
                      }
                    }}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  />
                  {/* Tracking lost indicator: red X on odd landmarks */}
                  {lostTracking && i % 2 === 1 && (
                    <path
                      d={`M${p.x - 4} ${p.y - 4} L${p.x + 4} ${p.y + 4} M${p.x + 4} ${p.y - 4} L${p.x - 4} ${p.y + 4}`}
                      stroke="#DC2626"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}

            {/* Live Angle Arc Indicator */}
            {isFront ? (
              // Left shoulder elevation arc
              <g className="elevation-arc">
                <path
                  d={`M${pts[5].x} ${pts[5].y} M${pts[5].x} ${pts[5].y + 35} A35 35 0 0 1 ${pts[5].x - 35 * Math.sin((amount * Math.PI) / 180)} ${pts[5].y + 35 * Math.cos((amount * Math.PI) / 180)}`}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="2.4"
                  strokeDasharray="3 3"
                />
              </g>
            ) : (
              // Knee angle arc
              <g className="knee-arc">
                <path
                  d={`M${pts[13].x} ${pts[13].y - 25} A25 25 0 0 1 ${pts[13].x + 22} ${pts[13].y + 12}`}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="2.4"
                />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
