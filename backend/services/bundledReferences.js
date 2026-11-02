export const bundledReferences = [
  { referenceId: 'demo-squat', versionId: 'demo-squat-v1', version: 1, exerciseName: 'Squat', cameraView: 'side', status: 'approved', mediaPath: 'demo:squat', demo: true },
  { referenceId: 'demo-toe-touch', versionId: 'demo-toe-touch-v1', version: 1, exerciseName: 'Toe Touch', cameraView: 'side', status: 'approved', mediaPath: 'demo:toetouch', demo: true },
  { referenceId: 'demo-arm-raise', versionId: 'demo-arm-raise-v1', version: 1, exerciseName: 'Side Arm Raise', cameraView: 'front', status: 'approved', mediaPath: 'demo:armraise', demo: true },
  { referenceId: 'demo-mini-squat', versionId: 'demo-mini-squat-v1', version: 1, exerciseName: 'Bilateral mini-squat', cameraView: 'side', status: 'approved', mediaPath: 'demo:squat', demo: true },
  { referenceId: 'demo-wall-slide', versionId: 'demo-wall-slide-v1', version: 1, exerciseName: 'Standing wall slide', cameraView: 'side', status: 'approved', mediaPath: 'demo:squat', demo: true },
  { referenceId: 'demo-heel-raise', versionId: 'demo-heel-raise-v1', version: 1, exerciseName: 'Bilateral standing heel raise', cameraView: 'side', status: 'approved', mediaPath: 'demo:toetouch', demo: true },
  { referenceId: 'demo-scaption', versionId: 'demo-scaption-v1', version: 1, exerciseName: 'Standing full-can scapular-plane elevation', cameraView: 'front', status: 'approved', mediaPath: 'demo:armraise', demo: true },
  { referenceId: 'demo-step-up', versionId: 'demo-step-up-v1', version: 1, exerciseName: 'Forward step-up and step-down', cameraView: 'side', status: 'approved', mediaPath: 'demo:squat', demo: true },
  { referenceId: 'demo-bridge', versionId: 'demo-bridge-v1', version: 1, exerciseName: 'Modified supine bridge', cameraView: 'side', status: 'approved', mediaPath: 'demo:squat', demo: true },
  { referenceId: 'demo-shoulder-er', versionId: 'demo-shoulder-er-v1', version: 1, exerciseName: 'Standing resisted shoulder external rotation', cameraView: 'front', status: 'approved', mediaPath: 'demo:armraise', demo: true },
  { referenceId: 'demo-heel-lowering', versionId: 'demo-heel-lowering-v1', version: 1, exerciseName: 'Assisted eccentric heel lowering', cameraView: 'side', status: 'approved', mediaPath: 'demo:toetouch', demo: true },
];

export function findReferenceForExercise(exerciseName, referenceVersionId = null) {
  if (referenceVersionId) {
    const direct = bundledReferences.find(entry => entry.versionId === referenceVersionId);
    if (direct) return direct;
  }
  const match = bundledReferences.find(entry => entry.exerciseName.toLowerCase() === String(exerciseName).toLowerCase());
  if (match) return match;

  // Fallback for custom / AI-generated exercises: dynamic 3D synthetic pose reference
  const slug = String(exerciseName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    referenceId: `ref-3d-${slug}`,
    versionId: `ref-3d-${slug}-v1`,
    version: 1,
    exerciseName,
    cameraView: 'front',
    status: 'approved',
    mediaPath: 'demo:3d-pose',
    isSynthetic: true,
  };
}
