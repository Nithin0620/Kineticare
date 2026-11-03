import './PreSessionChecklist.css';

/**
 * PreSessionChecklist component.
 * Displays a compact, restrained 4-point real-time pre-session checklist:
 * 1. Required landmarks visible
 * 2. Framing & safety margins
 * 3. Camera view orientation (side vs front)
 * 4. Camera frame rate
 *
 * Keeps the camera preview as the primary focus while presenting
 * clear overall status and one prominent, actionable next step.
 */
export default function PreSessionChecklist({
  validation,
  calibrationStatus,
  calibrationProgress = 0,
  calibrationMessage = '',
  onRetryCalibration,
  canCalibrate = false,
}) {
  if (!validation) return null;

  const { checks, ok: allOk, failingCheck, message } = validation;

  const items = [
    {
      id: 'landmarks',
      label: 'Body landmarks',
      check: checks?.landmarks,
      passedLabel: 'Full body visible',
      failingLabel: checks?.landmarks?.code === 'LANDMARKS_MISSING' ? 'Hips/arms out of frame' : (checks?.landmarks?.code || 'Not detected'),
    },
    {
      id: 'framing',
      label: 'Frame borders',
      check: checks?.framing,
      passedLabel: 'Centered with margins',
      failingLabel: checks?.framing?.code === 'MARGIN_BOTTOM' ? 'Touching bottom border' : (checks?.framing?.code || 'Check frame edge'),
    },
    {
      id: 'orientation',
      label: 'Camera angle',
      check: checks?.orientation,
      passedLabel: checks?.orientation?.code === 'VIEW_OK' ? 'Correct orientation' : 'View aligned',
      failingLabel: checks?.orientation?.code === 'VIEW_MISMATCH_FRONT' ? 'Face camera directly' : (checks?.orientation?.code === 'VIEW_MISMATCH_SIDE' ? 'Turn sideways' : 'Angle mismatch'),
    },
    {
      id: 'frameRate',
      label: 'Lighting & FPS',
      check: checks?.frameRate,
      passedLabel: `${checks?.frameRate?.fps || 30} FPS · Good light`,
      failingLabel: checks?.frameRate?.fps ? `Low FPS (${checks.frameRate.fps})` : 'FPS checking...',
    },
  ];

  return (
    <div className="camera-readiness-panel" role="region" aria-label="Camera readiness and positioning checks">
      {/* Top Header Row: Status badge and title */}
      <div className="readiness-header-row">
        <div className="readiness-title-wrap">
          <span className="readiness-icon" aria-hidden="true">📷</span>
          <h4 className="readiness-title">Positioning & Camera Setup</h4>
        </div>
        <span className={`readiness-status-badge ${allOk ? 'ready' : 'required'}`}>
          {allOk ? '✓ Ready to Calibrate' : '⚠️ Positioning Required'}
        </span>
      </div>

      {/* Primary Actionable Instruction Banner */}
      {failingCheck && (
        <div className="readiness-instruction-banner warn" role="alert">
          <span className="instruction-arrow" aria-hidden="true">👉</span>
          <span className="instruction-text">{failingCheck.message || message}</span>
        </div>
      )}

      {/* When All Checks Pass: Ready Banner with Calibrate Button */}
      {allOk && calibrationStatus !== 'collecting' && calibrationStatus !== 'ready' && (
        <div className="readiness-instruction-banner ok" role="status">
          <div className="instruction-content">
            <span className="instruction-check" aria-hidden="true">✓</span>
            <span className="instruction-text">
              Stance verified. Hold still for 2-second baseline measurement.
            </span>
          </div>
          {onRetryCalibration && (
            <button
              type="button"
              className="readiness-calibrate-btn"
              disabled={!canCalibrate}
              onClick={onRetryCalibration}
            >
              {calibrationStatus === 'error' ? 'Retry calibration' : 'Calibrate now'}
            </button>
          )}
        </div>
      )}

      {/* Calibration Progress Bar */}
      {calibrationStatus === 'collecting' && (
        <div className="readiness-collecting-wrap">
          <div className="row sp" style={{ fontSize: 12, marginBottom: 4 }}>
            <b>Measuring resting baseline...</b>
            <span>{calibrationProgress}%</span>
          </div>
          <div className="prog" style={{ height: 8 }}>
            <b style={{ width: `${calibrationProgress}%` }} />
          </div>
          <p className="mut" style={{ fontSize: 11, margin: '6px 0 0' }}>
            Hold completely still. Movement variance is tracked to ensure an accurate zero-degree resting baseline.
          </p>
        </div>
      )}

      {/* Calibration Error Notice */}
      {calibrationStatus === 'error' && (
        <div className="readiness-instruction-banner error" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span className="instruction-text">Setup needs another try: {calibrationMessage}</span>
          {onRetryCalibration && (
            <button type="button" className="btn sm" onClick={onRetryCalibration}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* 4 Compact Checks Row */}
      <div className="readiness-checks-grid">
        {items.map(item => {
          const isPassed = item.check?.ok;
          return (
            <div
              key={item.id}
              className={`readiness-check-item ${isPassed ? 'check-pass' : 'check-fail'}`}
              title={`${item.label}: ${isPassed ? item.passedLabel : item.failingLabel}`}
            >
              <span className="check-status-icon" aria-hidden="true">
                {isPassed ? '✓' : '⚠️'}
              </span>
              <div className="check-text-group">
                <span className="check-name">{item.label}</span>
                <span className="check-status-desc">
                  {isPassed ? item.passedLabel : item.failingLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
