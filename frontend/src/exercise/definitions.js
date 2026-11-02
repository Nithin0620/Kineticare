import { angleAt, namedKeypoints, visible } from '../vision/geometry.js';

export const EXERCISE_DEFINITIONS = {
  squat: {
    id: 'squat',
    name: 'Squat or mini-squat',
    cameraView: 'side',
    measurementVersion: 'squat-side-v1',
    setup: 'Stand side-on with your shoulder, hip, knee, and ankle visible.',
  },
  toeTouch: {
    id: 'toe-touch',
    name: 'Standing toe touch',
    cameraView: 'side',
    measurementVersion: 'toe-touch-side-v1',
    setup: 'Stand side-on with your shoulder, hip, and knee visible, then bend forward and return upright.',
  },
  armRaise: {
    id: 'arm-raise',
    name: 'Bilateral side arm raise',
    cameraView: 'front',
    measurementVersion: 'arm-raise-front-v1',
    setup: 'Face the camera with both shoulders, elbows, wrists, and hips visible.',
  },
  miniSquat: {
    id: 'mini-squat',
    name: 'Bilateral mini-squat',
    cameraView: 'side',
    measurementVersion: 'squat-side-v1',
    setup: 'Stand side-on with feet shoulder-width apart, knees and hips visible.',
  },
  wallSlide: {
    id: 'wall-slide',
    name: 'Standing wall slide',
    cameraView: 'side',
    measurementVersion: 'squat-side-v1',
    setup: 'Stand with back against a wall, side-on to camera with knees visible.',
  },
  heelRaise: {
    id: 'heel-raise',
    name: 'Bilateral standing heel raise',
    cameraView: 'side',
    measurementVersion: 'heel-raise-side-v1',
    setup: 'Stand side-on or facing camera with feet and ankles clearly visible.',
  },
  scaption: {
    id: 'scaption',
    name: 'Standing full-can scapular-plane elevation',
    cameraView: 'front',
    measurementVersion: 'scaption-front-v1',
    setup: 'Face camera with arms rotated slightly outward in the scapular plane.',
  },
};

/**
 * Starting repetition state machine parameters.
 */
export const EXERCISE_REP_PARAMETERS = {
  Squat: {
    name: 'Squat',
    joint: 'knee',
    direction: 'decreasing',
    upAngle: 165,
    downAngle: 130,
    hysteresisGap: 15,
    minRom: 25,
    minRomProgress: 0.65,
    minPhaseDurationMs: 300,
    minDurationMs: 700,
    maxCycleDurationMs: 7000,
    targetMin: 0.9,
    targetMax: 1.1,
  },
  'Bilateral mini-squat': {
    name: 'Bilateral mini-squat',
    joint: 'knee',
    direction: 'decreasing',
    upAngle: 165,
    downAngle: 135,
    hysteresisGap: 12,
    minRom: 20,
    minRomProgress: 0.65,
    minPhaseDurationMs: 300,
    minDurationMs: 700,
    maxCycleDurationMs: 7000,
    targetMin: 0.9,
    targetMax: 1.1,
  },
  'Standing wall slide': {
    name: 'Standing wall slide',
    joint: 'knee',
    direction: 'decreasing',
    upAngle: 165,
    downAngle: 120,
    hysteresisGap: 15,
    minRom: 25,
    minRomProgress: 0.65,
    minPhaseDurationMs: 300,
    minDurationMs: 800,
    maxCycleDurationMs: 8000,
    targetMin: 0.9,
    targetMax: 1.1,
  },
  'Side Arm Raise': {
    name: 'Side Arm Raise',
    joint: 'shoulder',
    direction: 'increasing',
    upAngle: 70,
    downAngle: 25,
    hysteresisGap: 15,
    minRom: 35,
    minRomProgress: 0.65,
    minPhaseDurationMs: 300,
    minDurationMs: 700,
    maxCycleDurationMs: 7000,
    targetMin: 0.9,
    targetMax: 1.1,
  },
  'Standing full-can scapular-plane elevation': {
    name: 'Standing full-can scapular-plane elevation',
    joint: 'shoulder',
    direction: 'increasing',
    upAngle: 70,
    downAngle: 25,
    hysteresisGap: 15,
    minRom: 35,
    minRomProgress: 0.65,
    minPhaseDurationMs: 300,
    minDurationMs: 700,
    maxCycleDurationMs: 7000,
    targetMin: 0.9,
    targetMax: 1.1,
  },
  'Toe Touch': {
    name: 'Toe Touch',
    joint: 'hip',
    direction: 'decreasing',
    upAngle: 155,
    downAngle: 115,
    hysteresisGap: 15,
    minRom: 35,
    minRomProgress: 0.65,
    minPhaseDurationMs: 300,
    minDurationMs: 800,
    maxCycleDurationMs: 8000,
    targetMin: 0.9,
    targetMax: 1.1,
  },
  'Bilateral standing heel raise': {
    name: 'Bilateral standing heel raise',
    joint: 'ankle',
    direction: 'increasing',
    upAngle: 45,
    downAngle: 15,
    hysteresisGap: 10,
    minRom: 15,
    minRomProgress: 0.6,
    minPhaseDurationMs: 250,
    minDurationMs: 600,
    maxCycleDurationMs: 6000,
    targetMin: 0.85,
    targetMax: 1.15,
  },
};

export function getExerciseParameters(name) {
  if (EXERCISE_REP_PARAMETERS[name]) return EXERCISE_REP_PARAMETERS[name];
  const lower = String(name).toLowerCase();
  if (lower.includes('squat') || lower.includes('knee') || lower.includes('lunge') || lower.includes('leg')) {
    return { ...EXERCISE_REP_PARAMETERS.Squat, name };
  }
  if (lower.includes('arm') || lower.includes('shoulder') || lower.includes('raise') || lower.includes('scaption')) {
    return { ...EXERCISE_REP_PARAMETERS['Side Arm Raise'], name };
  }
  if (lower.includes('toe') || lower.includes('bend') || lower.includes('hip')) {
    return { ...EXERCISE_REP_PARAMETERS['Toe Touch'], name };
  }
  if (lower.includes('heel') || lower.includes('calf') || lower.includes('ankle')) {
    return { ...EXERCISE_REP_PARAMETERS['Bilateral standing heel raise'], name };
  }
  return { ...EXERCISE_REP_PARAMETERS['Side Arm Raise'], name };
}

export function squatSideConfidence(keypoints, side = 'left') {
  const points = namedKeypoints(keypoints);
  const joints = [points[`${side}_hip`], points[`${side}_knee`], points[`${side}_ankle`]];
  const valid = joints.filter(j => j && Number.isFinite(j.score));
  if (!valid.length) return 0;
  return valid.reduce((sum, j) => sum + j.score, 0) / joints.length;
}

export function squatKneeAngle(keypoints, side = 'left', minimumScore = 0.25) {
  const points = namedKeypoints(keypoints);
  const hip = points[`${side}_hip`];
  const knee = points[`${side}_knee`];
  const ankle = points[`${side}_ankle`];
  if (visible([hip, knee], minimumScore)) {
    if (visible([ankle], minimumScore)) {
      return angleAt(hip, knee, ankle);
    }
    if (ankle && Number.isFinite(ankle.x) && Number.isFinite(ankle.y) && (ankle.score ?? 0) >= 0.1) {
      return angleAt(hip, knee, ankle);
    }
  }
  return null;
}

export function armRaiseAngle(keypoints, side, minimumScore = 0.2) {
  const points = namedKeypoints(keypoints);
  const hip = points[`${side}_hip`];
  const shoulder = points[`${side}_shoulder`];
  const elbow = points[`${side}_elbow`];
  const wrist = points[`${side}_wrist`];
  if (visible([hip, shoulder, elbow], minimumScore)) {
    return angleAt(hip, shoulder, elbow);
  }
  if (visible([hip, shoulder, wrist], minimumScore)) {
    return angleAt(hip, shoulder, wrist);
  }
  return null;
}

export function toeTouchHipAngle(keypoints, side = 'left', minimumScore = 0.2) {
  const points = namedKeypoints(keypoints);
  const joints = [points[`${side}_shoulder`], points[`${side}_hip`], points[`${side}_knee`]];
  return visible(joints, minimumScore) ? angleAt(...joints) : null;
}

export function ankleHeelRaiseAngle(keypoints, side = 'left', minimumScore = 0.15) {
  const points = namedKeypoints(keypoints);
  const knee = points[`${side}_knee`];
  const ankle = points[`${side}_ankle`];
  const heel = points[`${side}_heel`];
  const foot = points[`${side}_foot_index`];
  if (visible([knee, ankle], minimumScore) && (visible([heel], minimumScore) || visible([foot], minimumScore))) {
    const tip = heel || foot;
    return angleAt(knee, ankle, tip);
  }
  return null;
}
