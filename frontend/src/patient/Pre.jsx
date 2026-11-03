import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecords } from '../records/recordsContext';
import { toast } from '../components/toastBus';
import ReferenceVideo from '../components/ReferenceVideo';
import ExerciseDemoPlayer from '../components/ExerciseDemoPlayer';
import { exerciseMeta } from '../exercise/measure';
import { getExerciseCapability } from '../../../shared/exerciseCapabilities.js';

export default function PatientPre() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { patientId, patientPlan, createRequest, workspace } = useRecords();
  const [checks, setChecks] = useState([false, false, false]);
  const exIdx = state?.exIdx ?? 0;
  const plan = patientPlan(patientId);
  const x = plan?.items[exIdx];

  if (!x) return <div className="card">This exercise is no longer available in the current assignment.</div>;
  if (state?.assignmentVersion != null && state.assignmentVersion !== plan.v) {
    return (
      <div className="card">
        Your clinician updated this plan.{' '}
        <button className="btn" onClick={() => nav('/patient/workout')}>
          Open current workout
        </button>
      </div>
    );
  }

  const reference = workspace.references?.find(item => item.versionId === x.referenceVersionId);
  const capability = getExerciseCapability(x.ex);

  const requestHelp = async () => {
    if (!workspace.relationship) { nav('/patient/me'); return; }
    try {
      await createRequest(patientId, {
        requestId: crypto.randomUUID(),
        kind: 'help',
        message: `Help requested before ${x.ex}`,
        creatorId: patientId,
        createdAt: new Date().toISOString(),
        status: 'open',
      });
      toast('Help request sent to your clinician');
    } catch {
      toast('Help request was not saved. Check your connection and retry.');
    }
  };

  if (x.videoOnly || capability.isUnmeasured) {
    return (
      <>
        <button className="btn s sm" onClick={() => nav('/patient/workout')}>Back to workout</button>
        <h1 style={{ marginTop: 12 }}>{x.ex}</h1>
        
        <div className="card" style={{ borderLeft: '4px solid var(--pri)' }}>
          <div className="row sp">
            <h3 style={{ margin: 0 }}>Guided Rehabilitation Movement</h3>
            <span className="tag">Self-Guided Protocol</span>
          </div>
          <p className="mut" style={{ marginTop: 8 }}>
            Real-time camera angle tracking is not required for this movement. You will follow step-by-step guidance and log completed repetitions at your own pace.
          </p>
          {x.note && (
            <p style={{ marginTop: 6, fontStyle: 'italic', color: 'var(--ink)' }}>
              <b>Clinician note:</b> {x.note}
            </p>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {reference ? (
            <div className="vid"><ReferenceVideo mediaPath={reference.mediaPath} /></div>
          ) : (
            <ExerciseDemoPlayer exerciseName={x.ex} targetExcursionDeg={x.targetExcursionDeg} targetReps={x.targetReps} />
          )}
        </div>

        <button
          className="btn"
          style={{ width: '100%', marginTop: 12, marginBottom: 8 }}
          onClick={() => nav('/patient/live', { state: { ...state, exIdx, all: !!state?.all } })}
        >
          Begin Guided Exercise ({x.targetReps} reps)
        </button>

        <button className="btn s" style={{ width: '100%' }} onClick={() => nav('/patient/workout')}>
          Back to workout plan
        </button>
      </>
    );
  }

  return (
    <>
      <button className="btn s sm" onClick={() => nav('/patient/workout')}>Back</button>
      <h1 style={{ marginTop: 12 }}>{x.ex}</h1>

      <div className="card">
        <h3>Movement demonstration</h3>
        {reference ? (
          <div className="vid" style={{ marginBottom: 14 }}>
            <ReferenceVideo mediaPath={reference.mediaPath} />
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <ExerciseDemoPlayer exerciseName={x.ex} targetExcursionDeg={x.targetExcursionDeg} targetReps={x.targetReps} />
          </div>
        )}
        <p className="mut">
          Prescribed target: <b>{x.targetExcursionDeg}°</b> joint excursion · <b>{x.targetReps}</b> repetitions
        </p>
        {x.note && (
          <p className="mut" style={{ fontStyle: 'italic' }}>
            Clinician note: {x.note}
          </p>
        )}
      </div>

      <div className="card">
        <h3>Safety &amp; camera checklist</h3>
        {[
          'Lighting is clear and your full body or tracking region is visible.',
          'Your device is placed stably on a flat surface at waist or eye level.',
          'The floor is clear and free of trip hazards or obstacles.',
        ].map((label, index) => (
          <label key={index} className="check-label" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '8px 0' }}>
            <input
              type="checkbox"
              checked={checks[index]}
              onChange={event => setChecks(current => current.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))}
            />
            {label}
          </label>
        ))}
        <p className="mut" style={{ marginTop: 12 }}>{exerciseMeta(x.ex).setup}</p>
        <p className="mut" style={{ fontSize: 12 }}>
          Privacy guarantee: Camera processing runs 100% locally on your device via MoveNet. Video is never uploaded.
        </p>
      </div>

      <p className="mut" role="status" style={{ fontSize: 13, marginBottom: 16 }}>
        {checks.every(Boolean)
          ? '✓ Ready to begin. Hold still for initial calibration on the next screen.'
          : `Checklist: ${checks.filter(Boolean).length} of 3 complete. Complete all three to continue.`}
      </p>

      <button
        className="btn"
        disabled={!checks.every(Boolean)}
        style={{ width: '100%', marginBottom: 10 }}
        onClick={() => nav('/patient/live', { state: { ...state, exIdx, all: !!state?.all } })}
      >
        Continue to camera practice
      </button>

      <button className="btn s" style={{ width: '100%' }} onClick={requestHelp}>
        I need assistance
      </button>
    </>
  );
}
