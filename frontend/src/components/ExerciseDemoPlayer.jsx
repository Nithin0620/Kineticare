import { useState, useEffect, useRef, useMemo } from 'react';
import InteractivePoseFigure from '../landing/InteractivePoseFigure';
import { getExerciseCapability } from '../../../shared/exerciseCapabilities.js';
import './ExerciseDemoPlayer.css';

/**
 * ExerciseDemoPlayer — Flagship Realistic Animated Exercise Demonstration
 *
 * Combines Kineticare's distinctive hand-drawn editorial illustration character
 * with real-time articulated forward kinematics and MoveNet landmark overlays.
 */

export default function ExerciseDemoPlayer({
  exerciseName = 'Side Arm Raise',
  targetExcursionDeg = 75,
  targetReps = 5,
  compact = false,
  showControls = true,
  autoPlay = true,
  className = '',
}) {
  const capability = useMemo(() => getExerciseCapability(exerciseName), [exerciseName]);
  const view = capability.cameraView === 'front' ? 'front' : 'side';

  // Target movement excursion
  const targetAngle = capability.defaultTargetDeg || targetExcursionDeg || 45;

  // Playback state
  const prefersReduced = useMemo(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }, []);

  const [isPlaying, setIsPlaying] = useState(!prefersReduced && autoPlay);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [speed, setSpeed] = useState(1); // 0.75x, 1x, 1.25x
  const [layerMode, setLayerMode] = useState('both'); // 'sketch' | 'skeleton' | 'both'
  const [phase, setPhase] = useState('Rest position');

  // Animation timeline loop
  const animRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const cycleDurationMs = (4000 / speed); // 4-second natural rehabilitation cycle

    const loop = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) % cycleDurationMs;
      const progress = elapsed / cycleDurationMs; // 0.0 to 1.0

      // Natural physiological movement profile (smooth ease-in-out sinusoidal curve with dwell)
      let angle;
      if (progress < 0.45) {
        // Concentric movement (outward elevation or downward squat flexion)
        const t = progress / 0.45;
        const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
        angle = ease * targetAngle;
        setPhase(view === 'front' ? 'Concentric elevation' : 'Descent / Flexion');
      } else if (progress < 0.55) {
        // Peak hold / isometric dwell
        angle = targetAngle;
        setPhase('Peak excursion hold');
      } else {
        // Eccentric controlled return to starting position
        const t = (progress - 0.55) / 0.45;
        const ease = 0.5 + 0.5 * Math.cos(Math.PI * t);
        angle = ease * targetAngle;
        setPhase('Eccentric return');
      }

      setCurrentAngle(Math.round(angle));
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, targetAngle, speed, view]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    startTimeRef.current = null;
    setCurrentAngle(0);
    setIsPlaying(true);
  };

  return (
    <div className={`kc-demo-player ${compact ? 'kc-demo-compact' : ''} ${className}`}>
      {/* Header bar */}
      <div className="kc-demo-header">
        <div>
          <div className="kc-demo-title-row">
            <h4 className="kc-demo-title">{capability.name || exerciseName}</h4>
            <span className={`kc-demo-badge ${capability.capabilities?.cameraTracking ? 'badge-tracked' : 'badge-guide'}`}>
              {capability.capabilities?.cameraTracking ? 'Camera Tracked' : 'Illustrated Guide'}
            </span>
          </div>
          <span className="kc-demo-view-caption">
            {view === 'front' ? 'Front camera view' : 'Side camera view'} · Target: {targetAngle}°
          </span>
        </div>

        {/* Phase pill */}
        <div className="kc-demo-phase-pill">
          <span className="kc-phase-dot" />
          <span>{isPlaying ? phase : 'Paused'}</span>
        </div>
      </div>

      {/* Main interactive figure stage */}
      <div className="kc-demo-canvas-wrap">
        <InteractivePoseFigure
          view={view}
          amount={currentAngle}
          layerMode={layerMode}
          pointMode="17"
        />

        {/* Live angle readout overlay */}
        <div className="kc-demo-hud">
          <div className="kc-hud-stat">
            <span className="kc-hud-val">{currentAngle}°</span>
            <span className="kc-hud-sub">Current excursion</span>
          </div>
          <div className="kc-hud-stat">
            <span className="kc-hud-val">{targetAngle}°</span>
            <span className="kc-hud-sub">Target angle</span>
          </div>
          {targetReps > 0 && (
            <div className="kc-hud-stat">
              <span className="kc-hud-val">{targetReps}</span>
              <span className="kc-hud-sub">Target reps</span>
            </div>
          )}
        </div>
      </div>

      {/* Playback & View Controls */}
      {showControls && (
        <div className="kc-demo-controls">
          <div className="kc-demo-actions-left">
            <button
              type="button"
              className="kc-demo-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              type="button"
              className="kc-demo-btn kc-demo-btn-icon"
              onClick={handleReplay}
              aria-label="Replay from start"
              title="Restart movement"
            >
              ↺
            </button>
            <div className="kc-demo-speed-group">
              {[0.75, 1, 1.25].map(s => (
                <button
                  key={s}
                  type="button"
                  className={`kc-speed-btn ${speed === s ? 'active' : ''}`}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="kc-demo-actions-right">
            <div className="kc-layer-toggle" role="group" aria-label="Visual view mode">
              <button
                type="button"
                className={`kc-layer-btn ${layerMode === 'sketch' ? 'active' : ''}`}
                onClick={() => setLayerMode('sketch')}
              >
                Sketch
              </button>
              <button
                type="button"
                className={`kc-layer-btn ${layerMode === 'skeleton' ? 'active' : ''}`}
                onClick={() => setLayerMode('skeleton')}
              >
                Skeleton
              </button>
              <button
                type="button"
                className={`kc-layer-btn ${layerMode === 'both' ? 'active' : ''}`}
                onClick={() => setLayerMode('both')}
              >
                Both
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
