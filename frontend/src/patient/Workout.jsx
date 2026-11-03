import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecords } from '../records/recordsContext';
import { startDraft } from '../session/drafts';
import { INSTRUCTIONS } from '../data';
import ScoreTimeCharts from '../components/ExerciseCharts';
import ReferenceVideo from '../components/ReferenceVideo';
import ExerciseDemoPlayer from '../components/ExerciseDemoPlayer';
import ExportPdf from '../components/ExportPdf';
import Icon from '../components/Icon';
import { getExerciseCapability } from '../../../shared/exerciseCapabilities.js';

export default function PatientWorkout({ initialTab }) {
  const nav = useNavigate();
  const location = useLocation();
  const { patientId, patientPlan, sessions, workspace } = useRecords();
  const plan = patientPlan(patientId);
  const patient = workspace?.patients?.find(p => p.id === patientId);
  const last = sessions(patientId).at(-1);

  const defaultTab = initialTab || (location.pathname.includes('/plan') ? 'plan' : 'workout');
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [expandedExercise, setExpandedExercise] = useState(null);

  if (!plan) return <div className="card">No active assignment. Contact your clinician if you expected one.</div>;

  const start = (exIdx, all) => nav('/patient/pre', { state: startDraft(plan, patientId, exIdx, all) });
  const totalReps = plan.items.reduce((total, item) => total + item.targetReps, 0);

  return (
    <>
      <div className="row sp" style={{ marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Workout &amp; Plan</h1>
          <p className="mut" style={{ margin: '4px 0 0', fontSize: 13 }}>
            {plan.name} · {plan.source === 'self-guided' ? 'Starter guidance' : `Prescribed by ${plan.by}`}
            {plan.schedule?.weeklyFrequency ? ` · ${plan.schedule.weeklyFrequency}x / week` : ''}
          </p>
        </div>
        {patient && plan && <ExportPdf patient={patient} plan={plan} />}
      </div>

      {/* Segmented Tab Navigation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          background: 'var(--soft)',
          padding: 4,
          borderRadius: 14,
          marginBottom: 20,
          border: '1px solid var(--card-border)',
        }}
      >
        <button
          type="button"
          className="btn s"
          style={{
            minHeight: 38,
            padding: '6px 12px',
            borderRadius: 10,
            background: activeTab === 'workout' ? 'var(--card)' : 'transparent',
            color: activeTab === 'workout' ? 'var(--ink)' : 'var(--mut)',
            border: activeTab === 'workout' ? '1px solid var(--card-border)' : '1px solid transparent',
            fontWeight: activeTab === 'workout' ? 700 : 500,
            boxShadow: activeTab === 'workout' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
          }}
          onClick={() => setActiveTab('workout')}
        >
          <Icon name="workout" size={17} color={activeTab === 'workout' ? 'var(--pri)' : 'currentColor'} />
          Today&apos;s Workout
        </button>

        <button
          type="button"
          className="btn s"
          style={{
            minHeight: 38,
            padding: '6px 12px',
            borderRadius: 10,
            background: activeTab === 'plan' ? 'var(--card)' : 'transparent',
            color: activeTab === 'plan' ? 'var(--ink)' : 'var(--mut)',
            border: activeTab === 'plan' ? '1px solid var(--card-border)' : '1px solid transparent',
            fontWeight: activeTab === 'plan' ? 700 : 500,
            boxShadow: activeTab === 'plan' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
          }}
          onClick={() => setActiveTab('plan')}
        >
          <Icon name="plan" size={17} color={activeTab === 'plan' ? 'var(--pri)' : 'currentColor'} />
          Prescription &amp; Instructions
        </button>
      </div>

      {/* Top Routine Hero Card */}
      <div className="card" style={{ padding: '24px 20px', textAlign: 'center', marginBottom: 20 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--pri2)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 12px',
          }}
        >
          <Icon name="workout" size={24} color="var(--pri)" />
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>{plan.name}</h2>
        <p className="mut" style={{ margin: '0 0 18px', fontSize: 13 }}>
          {plan.items.length} guided exercises · {totalReps} target repetitions · Version {plan.v}
        </p>
        <button className="btn" style={{ width: '100%', maxWidth: 320 }} onClick={() => start(0, true)}>
          Start Full Workout Session
        </button>
      </div>

      {plan.source === 'self-guided' && (
        <div className="card" style={{ borderLeft: '4px solid var(--warn)', marginBottom: 16 }}>
          <b>Starter template (requires clinical review)</b>
          <p className="mut" style={{ margin: '4px 0 0', fontSize: 13 }}>
            This starter routine provides general mobility movements. Your clinician will personalize ROM targets and repetitions upon review.
          </p>
        </div>
      )}

      {/* TAB 1: Today's Workout Routine */}
      {activeTab === 'workout' && (
        <>
          <div className="row sp" style={{ margin: '20px 0 12px' }}>
            <h2 style={{ margin: 0, fontSize: 17 }}>Assigned Exercises</h2>
            <span className="mut" style={{ fontSize: 13 }}>Practice individually or start all</span>
          </div>

          {plan.items.map((item, index) => {
            const isExpanded = expandedExercise === item.ex;
            const ref = workspace?.references?.find(entry => entry.versionId === item.referenceVersionId);
            const cap = getExerciseCapability(item.ex);

            return (
              <div className="card" key={item.ex} style={{ padding: '18px 20px', marginBottom: 14 }}>
                <div className="row sp" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{item.ex}</span>
                      <span className={`tag ${cap.capabilities?.cameraTracking ? 'ok' : ''}`}>
                        {cap.capabilities?.cameraTracking ? 'Camera Tracked' : 'Guide Only'}
                      </span>
                    </div>
                    <div className="mut" style={{ fontSize: 13, marginTop: 4 }}>
                      {item.targetReps} reps · Target {item.targetExcursionDeg}° excursion
                    </div>
                    {item.note && (
                      <div style={{ fontSize: 12, color: 'var(--mut)', marginTop: 4 }}>
                        Clinician note: {item.note}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="btn s sm"
                      style={{ fontSize: 11, padding: '6px 12px' }}
                      onClick={() => setExpandedExercise(isExpanded ? null : item.ex)}
                    >
                      {isExpanded ? 'Hide Demo ▴' : 'Demo ▾'}
                    </button>
                    <button className="btn sm" onClick={() => start(index, false)}>
                      Practice
                    </button>
                  </div>
                </div>

                {/* Single Expanded Demonstration (No Duplication) */}
                {isExpanded && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--card-border)' }}>
                    {ref ? (
                      <div className="vid" style={{ maxWidth: 360, margin: '0 auto 12px' }}>
                        <ReferenceVideo mediaPath={ref.mediaPath} />
                      </div>
                    ) : (
                      <ExerciseDemoPlayer
                        exerciseName={item.ex}
                        targetExcursionDeg={item.targetExcursionDeg}
                        targetReps={item.targetReps}
                        compact
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <h2 style={{ marginTop: 28, fontSize: 17 }}>Previous Workout Results{last ? `: ${last.d}` : ''}</h2>
          {last ? (
            <ScoreTimeCharts results={last.r} />
          ) : (
            <div className="card">Your results and joint angles will appear here after your first workout session.</div>
          )}
        </>
      )}

      {/* TAB 2: Prescription & Instructions (Shown Exactly Once) */}
      {activeTab === 'plan' && (
        <>
          <div className="row sp" style={{ margin: '20px 0 12px' }}>
            <h2 style={{ margin: 0, fontSize: 17 }}>Prescription &amp; Movement Instructions</h2>
            <span className="mut" style={{ fontSize: 13 }}>{plan.items.length} prescribed movements</span>
          </div>

          {plan.items.map((item, index) => {
            const instructions = INSTRUCTIONS[item.ex] ?? [];
            const cap = getExerciseCapability(item.ex);

            return (
              <div className="card" key={item.ex} style={{ marginBottom: 16, padding: '20px' }}>
                <div className="row sp" style={{ marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{item.ex}</h3>
                    <span className="mut" style={{ fontSize: 12 }}>{cap.primaryJoint} · {item.targetReps} repetitions</span>
                  </div>
                  <span className="tag">{item.targetExcursionDeg}° excursion</span>
                </div>

                {item.note && (
                  <div style={{ padding: '8px 12px', background: 'var(--soft)', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                    <strong>Clinician precaution:</strong> {item.note}
                  </div>
                )}

                {/* Step-by-Step Clinical Instructions (Shown Exactly Once) */}
                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 12 }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ink)' }}>Step-by-Step Instructions:</h4>
                  {instructions.length > 0 ? (
                    instructions.map(([title, text]) => (
                      <p key={title} style={{ margin: '6px 0', fontSize: 13, lineHeight: 1.5 }}>
                        <strong>{title}:</strong> {text}
                      </p>
                    ))
                  ) : (
                    <p className="mut" style={{ fontSize: 13 }}>{cap.setup}</p>
                  )}
                </div>

                <div style={{ marginTop: 14, paddingTop: 10 }}>
                  <button className="btn sm" onClick={() => start(index, false)}>
                    Start practice for {item.ex}
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
