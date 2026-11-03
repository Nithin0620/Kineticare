/**
 * Kineticare Exercise Capability Registry — Single Source of Truth
 *
 * Defines explicit capabilities for every supported exercise in the platform:
 *  - instructions: step-by-step guidance
 *  - referenceVideo: recorded clinician demonstration
 *  - animatedDemonstration: procedural/illustrative 2D/3D motion
 *  - cameraTracking: real-time landmark extraction on device
 *  - repetitionCounting: state-machine based repetition cycle detector
 *  - rangeOfMotion: joint angle excursion measurement
 *  - exerciseFeedback: biomechanical tempo & phase feedback
 */

export const EXERCISE_CAPABILITIES = {
  'side-arm-raise': {
    id: 'side-arm-raise',
    name: 'Bilateral side arm raise',
    aliases: ['side arm raise', 'bilateral side arm raise', 'arm raise', 'shoulder abduction'],
    category: 'upper',
    cameraView: 'front',
    primaryJoint: 'Shoulder elevation / abduction',
    defaultTargetDeg: 75,
    normativeRangeDeg: [45, 120],
    defaultReps: 5,
    capabilities: {
      instructions: true,
      referenceVideo: true,
      animatedDemonstration: true,
      cameraTracking: true,
      repetitionCounting: true,
      rangeOfMotion: true,
      exerciseFeedback: true,
    },
    setup: 'Face the camera upright with both shoulders, elbows, wrists, and hips visible.',
    precautions: 'Do not hike shoulders towards ears. Keep neck relaxed.',
  },

  'squat': {
    id: 'squat',
    name: 'Squat',
    aliases: ['squat', 'standard squat', 'air squat'],
    category: 'lower',
    cameraView: 'side',
    primaryJoint: 'Knee flexion',
    defaultTargetDeg: 45,
    normativeRangeDeg: [30, 90],
    defaultReps: 5,
    capabilities: {
      instructions: true,
      referenceVideo: true,
      animatedDemonstration: true,
      cameraTracking: true,
      repetitionCounting: true,
      rangeOfMotion: true,
      exerciseFeedback: true,
    },
    setup: 'Stand side-on to camera with shoulder, hip, knee, and ankle visible.',
    precautions: 'Keep heels planted. Do not let knees cave inward.',
  },

  'mini-squat': {
    id: 'mini-squat',
    name: 'Bilateral mini-squat',
    aliases: ['bilateral mini-squat', 'mini squat', 'mini-squat'],
    category: 'lower',
    cameraView: 'side',
    primaryJoint: 'Knee flexion (shallow)',
    defaultTargetDeg: 35,
    normativeRangeDeg: [20, 50],
    defaultReps: 8,
    capabilities: {
      instructions: true,
      referenceVideo: true,
      animatedDemonstration: true,
      cameraTracking: true,
      repetitionCounting: true,
      rangeOfMotion: true,
      exerciseFeedback: true,
    },
    setup: 'Stand side-on with feet shoulder-width apart, knees and hips visible.',
    precautions: 'Move within comfortable pain-free knee range. Keep torso tall.',
  },

  'wall-slide': {
    id: 'wall-slide',
    name: 'Standing wall slide',
    aliases: ['standing wall slide', 'wall slide', 'wall squat'],
    category: 'lower',
    cameraView: 'side',
    primaryJoint: 'Knee flexion supported',
    defaultTargetDeg: 45,
    normativeRangeDeg: [30, 60],
    defaultReps: 6,
    capabilities: {
      instructions: true,
      referenceVideo: true,
      animatedDemonstration: true,
      cameraTracking: true,
      repetitionCounting: true,
      rangeOfMotion: true,
      exerciseFeedback: true,
    },
    setup: 'Stand with back against a wall, side-on to camera with knees visible.',
    precautions: 'Slide smoothly without pushing knees past toes.',
  },

  'toe-touch': {
    id: 'toe-touch',
    name: 'Standing toe touch',
    aliases: ['standing toe touch', 'toe touch', 'forward bend'],
    category: 'spine',
    cameraView: 'side',
    primaryJoint: 'Hip flexion / forward bend',
    defaultTargetDeg: 60,
    normativeRangeDeg: [40, 90],
    defaultReps: 5,
    capabilities: {
      instructions: true,
      referenceVideo: true,
      animatedDemonstration: true,
      cameraTracking: true,
      repetitionCounting: true,
      rangeOfMotion: true,
      exerciseFeedback: true,
    },
    setup: 'Stand side-on with shoulder, hip, and knee visible. Hinge forward from hips.',
    precautions: 'Do not force reach if experiencing acute back discomfort or sciatic symptoms.',
  },

  'heel-raise': {
    id: 'heel-raise',
    name: 'Bilateral standing heel raise',
    aliases: ['bilateral standing heel raise', 'heel raise', 'calf raise'],
    category: 'lower',
    cameraView: 'side',
    primaryJoint: 'Ankle plantarflexion',
    defaultTargetDeg: 25,
    normativeRangeDeg: [15, 35],
    defaultReps: 10,
    capabilities: {
      instructions: true,
      referenceVideo: true,
      animatedDemonstration: true,
      cameraTracking: true,
      repetitionCounting: true,
      rangeOfMotion: true,
      exerciseFeedback: true,
    },
    setup: 'Stand side-on or facing camera with feet and ankles clearly visible.',
    precautions: 'Use a stable support surface nearby if balance is unsteady.',
  },

  'scaption': {
    id: 'scaption',
    name: 'Standing full-can scapular-plane elevation',
    aliases: ['standing full-can scapular-plane elevation', 'scaption', 'full can elevation'],
    category: 'upper',
    cameraView: 'front',
    primaryJoint: 'Scapular plane elevation',
    defaultTargetDeg: 75,
    normativeRangeDeg: [45, 120],
    defaultReps: 6,
    capabilities: {
      instructions: true,
      referenceVideo: true,
      animatedDemonstration: true,
      cameraTracking: true,
      repetitionCounting: true,
      rangeOfMotion: true,
      exerciseFeedback: true,
    },
    setup: 'Face camera with arms rotated slightly outward (thumbs pointing up) in the scapular plane (~30° forward).',
    precautions: 'Maintain thumb-up position to avoid subacromial impingement.',
  },
};

/**
 * Resolves an exercise name or alias to its capability definition.
 * If not recognized as a camera-measured exercise, returns an explicit
 * unmeasured guide-only capability profile.
 */
export function getExerciseCapability(name) {
  if (!name) return getUnmeasuredProfile('Unspecified Movement');
  const lower = String(name).trim().toLowerCase();

  // 1. Direct match on id
  if (EXERCISE_CAPABILITIES[lower]) return EXERCISE_CAPABILITIES[lower];

  // 2. Alias match
  for (const item of Object.values(EXERCISE_CAPABILITIES)) {
    if (item.name.toLowerCase() === lower || item.aliases.some(a => a === lower)) {
      return item;
    }
  }

  // 3. Substring heuristic for primary camera-tracked movements
  if (lower.includes('scaption') || lower.includes('full-can')) {
    return EXERCISE_CAPABILITIES['scaption'];
  }
  if (lower.includes('arm raise') || lower.includes('side arm') || (lower.includes('shoulder') && lower.includes('abduction'))) {
    return EXERCISE_CAPABILITIES['side-arm-raise'];
  }
  if (lower.includes('mini-squat') || lower.includes('mini squat')) {
    return EXERCISE_CAPABILITIES['mini-squat'];
  }
  if (lower.includes('wall slide') || lower.includes('wall squat')) {
    return EXERCISE_CAPABILITIES['wall-slide'];
  }
  if (lower.includes('squat')) {
    return EXERCISE_CAPABILITIES['squat'];
  }
  if (lower.includes('toe touch') || lower.includes('forward bend')) {
    return EXERCISE_CAPABILITIES['toe-touch'];
  }
  if (lower.includes('heel raise') || lower.includes('calf raise')) {
    return EXERCISE_CAPABILITIES['heel-raise'];
  }

  // 4. Clearly identify as unmeasured / guide only
  return getUnmeasuredProfile(name);
}

function getUnmeasuredProfile(name) {
  return {
    id: `guide-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    aliases: [],
    category: 'custom',
    cameraView: 'none',
    primaryJoint: 'Unmeasured',
    defaultTargetDeg: 0,
    normativeRangeDeg: [0, 0],
    defaultReps: 5,
    capabilities: {
      instructions: true,
      referenceVideo: false,
      animatedDemonstration: false,
      cameraTracking: false,
      repetitionCounting: false,
      rangeOfMotion: false,
      exerciseFeedback: false,
    },
    setup: 'Follow the written clinical guide and clinician instructions. This movement is not camera-measured.',
    precautions: 'Move slowly and stop immediately if you experience sharp pain, dizziness, or numbness.',
    isUnmeasured: true,
  };
}

/**
 * Checks whether an exercise is confirmed to support real-time camera tracking.
 */
export function isCameraTrackedExercise(name) {
  const profile = getExerciseCapability(name);
  return profile.capabilities.cameraTracking === true;
}
