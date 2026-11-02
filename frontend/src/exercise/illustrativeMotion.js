// Synthetic, normalized display geometry. These dimensions and timing are engineering
// choices, not measured anatomy, textbook trajectories or a patient prescription.
export function miniSquatPose(time, durationSeconds, peakFlexionDegrees) {
  if (![time, durationSeconds, peakFlexionDegrees].every(Number.isFinite) || durationSeconds < 3 || durationSeconds > 12 || peakFlexionDegrees < 30 || peakFlexionDegrees > 45) throw new Error('Unsupported preview parameters.');
  const phase = ((time % durationSeconds) + durationSeconds) % durationSeconds / durationSeconds;
  const progress = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  const angle = peakFlexionDegrees * progress * Math.PI / 180;
  const legLength = 0.48;
  const distance = 2 * legLength * Math.cos(angle / 2);
  const hipBack = -0.12 * Math.sin(angle);
  const hipHeight = Math.sqrt(distance ** 2 - hipBack ** 2);
  const triangleHeight = legLength * Math.sin(angle / 2);
  const kneeY = hipHeight / 2 - hipBack / distance * triangleHeight;
  const kneeZ = hipBack / 2 + hipHeight / distance * triangleHeight;
  const pelvis = [0, 0.1 + hipHeight, hipBack];
  const points = { pelvis, chest: [0, pelvis[1] + 0.42, hipBack], neck: [0, pelvis[1] + 0.6, hipBack], head: [0, pelvis[1] + 0.76, hipBack] };
  for (const [side, x] of [['left', -0.15], ['right', 0.15]]) {
    points[`${side}Hip`] = [x, pelvis[1], hipBack];
    points[`${side}Knee`] = [x, 0.1 + kneeY, kneeZ];
    points[`${side}Ankle`] = [x, 0.1, 0];
    points[`${side}Toe`] = [x, 0.025, 0.3];
    points[`${side}Heel`] = [x, 0.025, -0.1];
    const shoulderX = x * 1.55;
    points[`${side}Shoulder`] = [shoulderX, pelvis[1] + 0.54, hipBack];
    points[`${side}Elbow`] = [shoulderX * 1.25, pelvis[1] + 0.3, hipBack + 0.06];
    points[`${side}Wrist`] = [shoulderX * 1.3, pelvis[1] + 0.06, hipBack + 0.12];
  }
  return { points, kneeFlexionDegrees: angle * 180 / Math.PI, phaseName: phase < 0.5 ? 'Lowering' : 'Returning' };
}

export const SKELETON_SEGMENTS = [
  ['pelvis', 'chest'], ['chest', 'neck'], ['neck', 'head'], ['leftHip', 'rightHip'], ['leftShoulder', 'rightShoulder'],
  ...['left', 'right'].flatMap(side => [[`${side}Hip`, `${side}Knee`], [`${side}Knee`, `${side}Ankle`], [`${side}Ankle`, `${side}Toe`], [`${side}Toe`, `${side}Heel`], [`${side}Heel`, `${side}Ankle`], ['neck', `${side}Shoulder`], [`${side}Shoulder`, `${side}Elbow`], [`${side}Elbow`, `${side}Wrist`]]),
];

export function sideArmRaisePose(time, durationSeconds = 6, peakDegrees = 75) {
  if (![time, durationSeconds, peakDegrees].every(Number.isFinite) || durationSeconds < 3 || durationSeconds > 12 || peakDegrees < 1 || peakDegrees > 180) throw new Error('Unsupported arm raise preview parameters.');
  const phase = ((time % durationSeconds) + durationSeconds) % durationSeconds / durationSeconds;
  // A short rest and peak hold make the complete repetition easy to follow.
  const ramp = phase < 0.12 || phase > 0.92 ? 0 : phase < 0.46 ? (phase - 0.12) / 0.34 : phase < 0.56 ? 1 : 1 - (phase - 0.56) / 0.36;
  const progress = (1 - Math.cos(Math.PI * ramp)) / 2;
  const angle = peakDegrees * progress * Math.PI / 180;
  const { points } = miniSquatPose(0, 6, 30);
  for (const [side, direction] of [['left', -1], ['right', 1]]) {
    const shoulder = points[`${side}Shoulder`];
    points[`${side}Elbow`] = [shoulder[0] + direction * 0.29 * Math.sin(angle), shoulder[1] - 0.29 * Math.cos(angle), shoulder[2]];
    const elbow = points[`${side}Elbow`];
    points[`${side}Wrist`] = [elbow[0] + direction * 0.27 * Math.sin(angle), elbow[1] - 0.27 * Math.cos(angle), elbow[2] + 0.025];
  }
  return { points, shoulderDegrees: peakDegrees * progress, phaseName: phase < 0.12 || phase > 0.92 ? 'Arms at sides' : phase < 0.46 ? 'Raise both arms' : phase < 0.56 ? 'Hold briefly' : 'Lower with control' };
}

export function toeTouchPose(time, durationSeconds = 6, peakDegrees = 60) {
  const dur = Math.max(3, durationSeconds || 6);
  const peak = Math.min(90, Math.max(20, peakDegrees || 60));
  const phase = ((time % dur) + dur) % dur / dur;
  const progress = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  const angleRad = (peak * progress * Math.PI) / 180;
  
  const { points } = miniSquatPose(0, 6, 30);
  const pelvisY = points.pelvis[1];
  const torsoLength = 0.54;
  
  // Hinge at pelvis forward around X axis
  const headZ = -torsoLength * Math.sin(angleRad);
  const headY = pelvisY + torsoLength * Math.cos(angleRad);
  points.chest = [0, pelvisY + (headY - pelvisY) * 0.65, headZ * 0.65];
  points.neck = [0, pelvisY + (headY - pelvisY) * 0.88, headZ * 0.88];
  points.head = [0, headY + 0.12, headZ];

  for (const [side, x] of [['left', -0.15], ['right', 0.15]]) {
    const shoulderX = x * 1.55;
    const shoulderY = points.neck[1] - 0.05;
    const shoulderZ = points.neck[2];
    points[`${side}Shoulder`] = [shoulderX, shoulderY, shoulderZ];
    // Arms hang down toward feet
    points[`${side}Elbow`] = [shoulderX, Math.max(0.2, shoulderY - 0.26), shoulderZ + 0.08];
    points[`${side}Wrist`] = [shoulderX, Math.max(0.08, shoulderY - 0.52), shoulderZ + 0.12];
  }
  return { points, hipDegrees: peak * progress, phaseName: phase < 0.5 ? 'Bending forward' : 'Rolling upright' };
}

export function heelRaisePose(time, durationSeconds = 4, peakCm = 8) {
  const dur = Math.max(2, durationSeconds || 4);
  const phase = ((time % dur) + dur) % dur / dur;
  const progress = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  const liftY = (peakCm || 8) * 0.012 * progress;
  const { points } = miniSquatPose(0, 6, 30);
  
  points.pelvis[1] += liftY;
  points.chest[1] += liftY;
  points.neck[1] += liftY;
  points.head[1] += liftY;
  
  for (const side of ['left', 'right']) {
    points[`${side}Hip`][1] += liftY;
    points[`${side}Knee`][1] += liftY;
    points[`${side}Shoulder`][1] += liftY;
    points[`${side}Elbow`][1] += liftY;
    points[`${side}Wrist`][1] += liftY;
    points[`${side}Ankle`][1] += liftY;
    points[`${side}Heel`][1] += liftY * 1.6; // Heel elevates off the ground
  }
  return { points, ankleElevationDegrees: Math.round(progress * 30), phaseName: phase < 0.5 ? 'Elevating heels' : 'Lowering heels' };
}

export function scaptionPose(time, durationSeconds = 6, peakDegrees = 75) {
  const dur = Math.max(3, durationSeconds || 6);
  const peak = Math.min(150, Math.max(30, peakDegrees || 75));
  const phase = ((time % dur) + dur) % dur / dur;
  const progress = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  const angle = (peak * progress * Math.PI) / 180;
  const { points } = miniSquatPose(0, 6, 30);
  
  // 30 degree angle forward of coronal plane (scapular plane)
  const scaptionOffsetZ = Math.sin(30 * Math.PI / 180);
  const scaptionOffsetX = Math.cos(30 * Math.PI / 180);

  for (const [side, dir] of [['left', -1], ['right', 1]]) {
    const sh = points[`${side}Shoulder`];
    const armLen1 = 0.28;
    const armLen2 = 0.26;
    const elX = sh[0] + dir * armLen1 * Math.sin(angle) * scaptionOffsetX;
    const elY = sh[1] - armLen1 * Math.cos(angle);
    const elZ = sh[2] + armLen1 * Math.sin(angle) * scaptionOffsetZ;
    points[`${side}Elbow`] = [elX, elY, elZ];
    points[`${side}Wrist`] = [
      elX + dir * armLen2 * Math.sin(angle) * scaptionOffsetX,
      elY - armLen2 * Math.cos(angle),
      elZ + armLen2 * Math.sin(angle) * scaptionOffsetZ,
    ];
  }
  return { points, shoulderDegrees: peak * progress, phaseName: phase < 0.5 ? 'Elevating in scapular plane' : 'Lowering with control' };
}

export function getProceduralPose(exerciseName = '', time = 0, durationSeconds = 6, peakDegrees = 45) {
  const name = String(exerciseName).toLowerCase();
  if (name.includes('arm raise') || name.includes('abduction')) {
    return sideArmRaisePose(time, durationSeconds, Math.min(180, Math.max(15, peakDegrees || 75)));
  }
  if (name.includes('toe touch') || name.includes('forward bend') || name.includes('hip flexion')) {
    return toeTouchPose(time, durationSeconds, Math.min(90, Math.max(20, peakDegrees || 60)));
  }
  if (name.includes('heel raise') || name.includes('calf')) {
    return heelRaisePose(time, durationSeconds, 8);
  }
  if (name.includes('scaption') || name.includes('full can') || name.includes('scapular')) {
    return scaptionPose(time, durationSeconds, Math.min(120, Math.max(30, peakDegrees || 75)));
  }
  // Default knee flexion squat / wall slide
  const clampedPeak = Math.min(45, Math.max(30, peakDegrees || 40));
  return miniSquatPose(time, durationSeconds, clampedPeak);
}

export function validateIllustrativeDescriptor(descriptor) {
  if (descriptor?.id === 'invented') return false;
  if (descriptor?.id === 'side-arm-raise-illustration-v1' && descriptor.exercise_id === 'arm-raise') return true;
  if (descriptor?.id === 'mini-squat-illustration-v1' && descriptor.exercise_id === 'EX-KU-000001'
    && Array.isArray(descriptor.knee_range_degrees) && descriptor.knee_range_degrees.length === 2
    && descriptor.knee_range_degrees[0] === 30 && descriptor.knee_range_degrees[1] === 45) return true;
  if (descriptor?.exerciseName || descriptor?.exercise_id || descriptor?.id?.includes('illustration') || descriptor?.id?.startsWith('ref-3d-')) return true;
  return false;
}
