import {
  armRaiseAngle,
  squatKneeAngle,
  toeTouchHipAngle,
  ankleHeelRaiseAngle,
  squatSideConfidence,
  EXERCISE_DEFINITIONS,
  EXERCISE_REP_PARAMETERS,
  getExerciseParameters,
} from './definitions.js';
import { DEFAULT_REP_CONFIG } from './engine.js';

// Exercises measured from a side view, one body side at a time. For these the joint angle
// shrinks as the movement deepens, so progress = rest angle - current angle.
const SIDE_ANGLE = {
  Squat: squatKneeAngle,
  'Toe Touch': toeTouchHipAngle,
  'Bilateral mini-squat': squatKneeAngle,
  'Standing wall slide': squatKneeAngle,
  'Bilateral standing heel raise': ankleHeelRaiseAngle,
};

export const isSideExercise = name => {
  if (name in SIDE_ANGLE) return true;
  const lower = String(name).toLowerCase();
  return lower.includes('squat') || lower.includes('knee') || lower.includes('toe') || lower.includes('bend') || lower.includes('wall slide') || lower.includes('heel');
};

export const exerciseMeta = name => {
  const direct = {
    Squat: { ...EXERCISE_DEFINITIONS.squat, key: 'squat', angleLabel: 'Knee angle' },
    'Toe Touch': { ...EXERCISE_DEFINITIONS.toeTouch, key: 'toe-touch', angleLabel: 'Hip angle' },
    'Bilateral mini-squat': { ...EXERCISE_DEFINITIONS.miniSquat, key: 'mini-squat', angleLabel: 'Knee angle' },
    'Standing wall slide': { ...EXERCISE_DEFINITIONS.wallSlide, key: 'wall-slide', angleLabel: 'Knee angle' },
    'Bilateral standing heel raise': { ...EXERCISE_DEFINITIONS.heelRaise, key: 'heel-raise', angleLabel: 'Ankle angle' },
    'Standing full-can scapular-plane elevation': { ...EXERCISE_DEFINITIONS.scaption, key: 'scaption', angleLabel: 'Scapular angle' },
  }[name];
  if (direct) return direct;

  const lower = String(name).toLowerCase();
  if (lower.includes('squat') || lower.includes('knee') || lower.includes('lunge') || lower.includes('leg')) {
    return { ...EXERCISE_DEFINITIONS.squat, key: 'squat', name, angleLabel: 'Knee angle' };
  }
  if (lower.includes('toe') || lower.includes('bend') || lower.includes('hip')) {
    return { ...EXERCISE_DEFINITIONS.toeTouch, key: 'toe-touch', name, angleLabel: 'Hip angle' };
  }
  if (lower.includes('heel') || lower.includes('calf') || lower.includes('ankle')) {
    return { ...EXERCISE_DEFINITIONS.heelRaise, key: 'heel-raise', name, angleLabel: 'Ankle angle' };
  }
  return { ...EXERCISE_DEFINITIONS.armRaise, key: 'arm-raise', name, angleLabel: 'Shoulder angle (lower arm)' };
};

// Returns the angle to track and the body side used.
// For Squat, when not locked, selects the side with the higher average landmark confidence (hip, knee, ankle).
export function measureAngle(name, keypoints, lockedSide = null) {
  let sideAngle = SIDE_ANGLE[name];
  if (!sideAngle && isSideExercise(name)) {
    const lower = String(name).toLowerCase();
    if (lower.includes('toe') || lower.includes('bend') || lower.includes('hip')) {
      sideAngle = toeTouchHipAngle;
    } else if (lower.includes('heel') || lower.includes('calf') || lower.includes('ankle')) {
      sideAngle = ankleHeelRaiseAngle;
    } else {
      sideAngle = squatKneeAngle;
    }
  }

  if (sideAngle) {
    const available = ['left', 'right']
      .map(side => ({
        side,
        angle: sideAngle(keypoints, side),
        confidence: squatSideConfidence(keypoints, side),
      }))
      .filter(result => Number.isFinite(result.angle));
    if (!available.length) return { angle: null, side: lockedSide };

    let selected;
    if (lockedSide && available.some(result => result.side === lockedSide)) {
      selected = available.find(result => result.side === lockedSide);
    } else if (name === 'Squat' || String(name).toLowerCase().includes('squat')) {
      // Use the side with higher average landmark confidence
      selected = available.reduce((best, curr) => (curr.confidence > best.confidence ? curr : best), available[0]);
    } else {
      selected = available[0];
    }
    return { angle: selected.angle, side: selected.side };
  }
  const angles = ['left', 'right'].map(side => armRaiseAngle(keypoints, side)).filter(Number.isFinite);
  return { angle: angles.length === 2 ? Math.min(...angles) : null, side: lockedSide };
}

// Positive when the person has moved away from rest in the assigned direction.
export const movementSignal = (name, rest, angle) => (isSideExercise(name) ? rest - angle : angle - rest);

export function calibratedProgress(name, rest, angle, target) {
  if (![rest, angle, target].every(Number.isFinite) || target <= 0) return null;
  return movementSignal(name, rest, angle) / target;
}

// Builds the exercise-specific repetition configuration with hysteresis and timing constraints.
export function repConfig(name, rest, target) {
  const baseParams = getExerciseParameters(name);
  const targetDeg = target || (name === 'Squat' ? 45 : name === 'Side Arm Raise' ? 75 : name === 'Toe Touch' ? 60 : 45);
  const isSide = isSideExercise(name);
  const availableRange = isSide ? (rest || 180) : 180 - (rest || 0);

  let upAngle = baseParams.upAngle;
  let downAngle = baseParams.downAngle;
  if (Number.isFinite(rest) && Number.isFinite(targetDeg)) {
    if (isSide) {
      upAngle = rest - (baseParams.hysteresisGap || 15);
      downAngle = rest - targetDeg;
    } else {
      downAngle = rest + (baseParams.hysteresisGap || 15);
      upAngle = rest + targetDeg;
    }
  }

  return {
    ...DEFAULT_REP_CONFIG,
    ...baseParams,
    rest,
    targetExcursionDeg: targetDeg,
    upAngle,
    downAngle,
    minRom: baseParams.minRom ?? Math.max(20, targetDeg * 0.65),
    maxPlausible: Math.max(DEFAULT_REP_CONFIG.maxPlausible, availableRange / targetDeg),
  };
}
