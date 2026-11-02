import { lazy, Suspense, useEffect, useState } from 'react';
import { loadReferenceMedia } from '../services/media';
import SideArmRaiseDemo from './SideArmRaiseDemo';

const ExerciseAnimationPreview = lazy(() => import('./ExerciseAnimationPreview'));

export default function ReferenceVideo({ mediaPath, exerciseName, loop = false, autoPlay = false, controls = true }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let currentUrl = '';
    let cancelled = false;
    if (!mediaPath || mediaPath === 'demo:armraise' || mediaPath === 'demo:3d-pose') return undefined;
    loadReferenceMedia(mediaPath).then(nextUrl => {
      if (cancelled) return URL.revokeObjectURL(nextUrl);
      currentUrl = nextUrl;
      setUrl(nextUrl);
    }).catch(() => setError('Reference video could not be loaded.'));
    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [mediaPath]);

  if (mediaPath === 'demo:armraise') {
    return <SideArmRaiseDemo studio={false} />;
  }

  if (mediaPath === 'demo:3d-pose' || (!url && error)) {
    return (
      <Suspense fallback={<p className="mut">Loading 3D motion demo…</p>}>
        <ExerciseAnimationPreview
          descriptor={{
            id: `preview-${String(exerciseName || 'movement').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            exerciseName: exerciseName || 'Movement',
          }}
          compact
        />
      </Suspense>
    );
  }

  if (!url && !error) return <p className="mut">Loading reference video…</p>;
  return <video controls={controls} loop={loop} autoPlay={autoPlay} muted={autoPlay} playsInline src={url} style={{ width: '100%', borderRadius: 14 }} />;
}
