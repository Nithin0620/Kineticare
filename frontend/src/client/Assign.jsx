import { useState, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ALL_EXERCISES, VIDEO_ONLY_EXERCISES, DEMO_REFERENCES, getCustomExercises, saveCustomExercise } from '../data';
import { useRecords } from '../records/recordsContext';
import { toast } from '../components/toastBus';
import { useAuth } from '../auth/authContext';
import { assessmentIsStale } from '../../../shared/assessmentFields.js';
import { getExerciseCapability } from '../../../shared/exerciseCapabilities.js';
import { connectedApi } from '../services/atlasRecords';
import { isSideExercise, exerciseMeta } from '../exercise/measure';
import Icon from '../components/Icon';

const ExerciseAnimationPreview = lazy(() => import('../components/ExerciseAnimationPreview'));

const defaults = exercise => {
  const cap = getExerciseCapability(exercise);
  const isTracked = cap.capabilities.cameraTracking;
  const isArm = exercise.toLowerCase().includes('arm') || exercise.toLowerCase().includes('shoulder') || exercise.toLowerCase().includes('scaption');
  const isHip = exercise.toLowerCase().includes('toe') || exercise.toLowerCase().includes('bend') || exercise.toLowerCase().includes('hip');
  const isAnkle = exercise.toLowerCase().includes('heel') || exercise.toLowerCase().includes('calf');
  const defTargetDeg = isTracked ? (isArm ? 75 : isHip ? 60 : isAnkle ? 25 : 45) : 0;

  return {
    ex: exercise,
    checked: false,
    t: 45,
    targetReps: 5,
    targetExcursionDeg: defTargetDeg,
    videoOnly: !isTracked || VIDEO_ONLY_EXERCISES.includes(exercise),
    note: '',
    referenceVersionId: '',
  };
};

function getExerciseCategory(name) {
  const lower = name.toLowerCase();
  if (lower.includes('squat') || lower.includes('knee') || lower.includes('lunge') || lower.includes('wall slide') || lower.includes('step') || lower.includes('heel') || lower.includes('calf')) {
    return 'lower';
  }
  if (lower.includes('arm') || lower.includes('shoulder') || lower.includes('scaption') || lower.includes('press') || lower.includes('rotat')) {
    return 'upper';
  }
  if (lower.includes('toe') || lower.includes('bend') || lower.includes('bridge') || lower.includes('spine') || lower.includes('hip')) {
    return 'mobility';
  }
  return 'custom';
}

export default function ClientAssign() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const { workspace, assignment, assignmentDraft, saveAssignmentDraft, publishAssignment } = useRecords();
  const patient = workspace.patients.find(item => item.id === id);
  const current = assignment(id);
  const savedDraft = assignmentDraft(id);
  const initial = savedDraft ?? current;
  const assessments = workspace.assessments?.[id] ?? [];
  const [assessmentKey, setAssessmentKey] = useState(initial?.assessmentId ? `${initial.assessmentId}:v${initial.assessmentVersion}` : '');
  const assessment = assessments.find(item => `${item.assessmentId}:v${item.version}` === assessmentKey);
  const [planName, setPlanName] = useState(initial?.name ?? 'Mobility plan');
  const [frequency, setFrequency] = useState(initial?.schedule?.weeklyFrequency ?? 3);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewingPose, setPreviewingPose] = useState(null);

  // New exercise creator modal / inline form
  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customJoint, setCustomJoint] = useState('knee');
  const [customAngle, setCustomAngle] = useState(45);
  const [customView, setCustomView] = useState('side');

  // AI Generator state
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReference, setAiReference] = useState('Kisner & Colby, Therapeutic Exercise, 6th edition (2012)');
  const [aiReferenceNotes, setAiReferenceNotes] = useState('');
  const [aiConsent, setAiConsent] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);
  const [aiError, setAiError] = useState('');

  // Compile full pool of exercises
  const availableExerciseNames = useMemo(() => {
    const customList = getCustomExercises().map(item => item.name);
    const initialList = (initial?.items ?? []).map(item => item.ex);
    const set = new Set([...ALL_EXERCISES, ...customList, ...initialList]);
    return Array.from(set);
  }, [initial]);

  const approvedReferences = exercise => {
    const list = (workspace.references || []).concat(DEMO_REFERENCES);
    const matching = list.filter(r => r.exerciseName.toLowerCase() === exercise.toLowerCase() && r.status === 'approved');
    if (matching.length) {
      // Deduplicate by versionId
      const seen = new Set();
      return matching.filter(r => {
        if (seen.has(r.versionId)) return false;
        seen.add(r.versionId);
        return true;
      });
    }
    // Synthetic reference for custom/generated exercises
    const slug = exercise.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return [{
      referenceId: `ref-3d-${slug}`,
      versionId: `ref-3d-${slug}-v1`,
      version: 1,
      exerciseName: exercise,
      cameraView: isSideExercise(exercise) ? 'side' : 'front',
      status: 'approved',
      mediaPath: 'demo:3d-pose',
      isSynthetic: true,
    }];
  };

  const [items, setItems] = useState(() => {
    return availableExerciseNames.map(exercise => {
      const existing = initial?.items?.find(candidate => candidate.ex === exercise);
      const refs = approvedReferences(exercise);
      if (existing) {
        return {
          ...defaults(exercise),
          ...existing,
          checked: true,
          referenceVersionId: existing.referenceVersionId || refs[0]?.versionId || '',
        };
      }
      return {
        ...defaults(exercise),
        referenceVersionId: refs[0]?.versionId || '',
      };
    });
  });

  const setItemByEx = (exerciseName, change) => {
    setItems(currentItems => {
      const idx = currentItems.findIndex(i => i.ex === exerciseName);
      if (idx === -1) {
        // New item being toggled/added
        const refs = approvedReferences(exerciseName);
        const newItem = {
          ...defaults(exerciseName),
          ...change,
          referenceVersionId: change.referenceVersionId || refs[0]?.versionId || '',
        };
        return [...currentItems, newItem];
      }
      return currentItems.map((item, i) => (i === idx ? { ...item, ...change } : item));
    });
  };

  const selectedItems = items.filter(i => i.checked);

  // Filter exercises for display
  const displayedExercises = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        if (!item.ex.toLowerCase().includes(query)) return false;
      }
      // Category filter
      if (activeCategory === 'selected') return item.checked;
      if (activeCategory === 'all') return true;
      return getExerciseCategory(item.ex) === activeCategory;
    });
  }, [items, searchQuery, activeCategory]);

  if (!patient) return <div className="card">Patient not found.</div>;

  const handleAddCustom = e => {
    e.preventDefault();
    const name = customName.trim();
    if (!name) return;

    saveCustomExercise({
      name,
      category: customJoint === 'knee' ? 'Lower Extremity' : customJoint === 'shoulder' ? 'Upper Extremity' : 'Mobility',
      primaryJoint: customJoint,
      defaultTargetDeg: Number(customAngle) || 45,
      cameraView: customView,
      createdAt: new Date().toISOString(),
    });

    const refs = approvedReferences(name);
    setItemByEx(name, {
      checked: true,
      targetExcursionDeg: Number(customAngle) || 45,
      referenceVersionId: refs[0]?.versionId || '',
    });

    setCustomName('');
    setShowAddModal(false);
    toast(`Added "${name}" to exercise plan!`);
  };

  const handleAiGenerate = async e => {
    e.preventDefault();
    const brief = aiPrompt.trim();
    if (!brief || !aiConsent) return;

    setAiGenerating(true);
    setAiError('');
    try {
      const draft = await connectedApi('ai/drafts', {
        brief,
        reference: aiReference.trim() || 'Kisner & Colby, Therapeutic Exercise, 6th edition (2012)',
        referenceNotes: aiReferenceNotes.trim() || `Prescribed clinical exercise rationale for: ${brief}`,
        consent: true,
      });
      setAiDraft(draft);
    } catch (cause) {
      setAiError(cause.message || 'AI drafting failed. Check backend connection and Gemini configuration.');
    } finally {
      setAiGenerating(false);
    }
  };

  const approveAiDraftAndAdd = async () => {
    if (!aiDraft?.exercise) return;
    const name = aiDraft.exercise.name;

    try {
      if (aiDraft._id) {
        await connectedApi(`ai/drafts/${aiDraft._id}/review`, {
          status: 'reviewed',
          note: 'Approved by prescribing clinician for patient plan inclusion.',
        }).catch(() => {});
      }
    } catch {
      // Non-blocking if offline/local
    }

    saveCustomExercise({
      name,
      category: 'Clinician Reviewed Protocol',
      primaryJoint: 'Unmeasured',
      defaultTargetDeg: 0,
      cameraView: 'none',
      instructions: aiDraft.exercise.steps || [],
      precautions: aiDraft.exercise.precautions || [],
      videoOnly: true,
      createdAt: new Date().toISOString(),
    });

    const refs = approvedReferences(name);
    setItemByEx(name, {
      checked: true,
      targetExcursionDeg: 0,
      targetReps: 5,
      t: 45,
      videoOnly: true,
      note: aiDraft.exercise.description || 'Follow prescribed form cues.',
      referenceVersionId: refs[0]?.versionId || '',
    });

    setShowAiGenModal(false);
    setAiPrompt('');
    setAiDraft(null);
    toast(`Approved "${name}" and added to plan as guided protocol!`);
  };

  const build = status => ({
    assignmentId: current?.assignmentId ?? crypto.randomUUID(),
    name: planName.trim() || 'Plan',
    v: (current?.v ?? 0) + 1,
    by: user.displayName,
    clinicianUid: user.uid,
    patientUid: id,
    assessmentId: assessment?.assessmentId ?? null,
    assessmentVersion: assessment?.version ?? null,
    status,
    schedule: { weeklyFrequency: frequency },
    createdAt: new Date().toISOString(),
    items: selectedItems.map(item => {
      const allRefs = (workspace.references || []).concat(DEMO_REFERENCES);
      const reference = allRefs.find(candidate => candidate.versionId === item.referenceVersionId) || approvedReferences(item.ex)[0];
      return Object.fromEntries(
        Object.entries({
          ...item,
          referenceId: reference?.referenceId ?? `ref-3d-${item.ex.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          referenceVersionId: reference?.versionId ?? `ref-3d-${item.ex.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-v1`,
          referencePath: `references/${reference?.referenceId ?? `ref-3d-${item.ex.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}/versions/${reference?.versionId ?? `ref-3d-${item.ex.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-v1`}`,
        }).filter(([key]) => key !== 'checked')
      );
    }),
  });

  const validate = assignmentValue => {
    if (!assessment) return 'Select a published assessment first.';
    if (!assignmentValue.items.length) return 'Select at least one exercise for the prescription.';
    if (!Number.isInteger(frequency) || frequency < 1 || frequency > 7) return 'Weekly frequency must be between 1 and 7 sessions.';
    for (const item of assignmentValue.items) {
      if (![item.t, item.targetReps, item.targetExcursionDeg].every(Number.isFinite)) return `Enter valid numerical targets for ${item.ex}.`;
      if (item.t < 10 || item.t > 1800 || item.targetReps < 1 || item.targetReps > 100) return `Targets for ${item.ex} are outside the supported clinical range.`;
      if (!item.videoOnly && (item.targetExcursionDeg <= 0 || item.targetExcursionDeg > 180)) return `Target degrees for ${item.ex} must be between 1° and 180°.`;
    }
    return '';
  };

  const saveDraft = async () => {
    if (!selectedItems.length) {
      setError('Select at least one exercise to save a draft.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await saveAssignmentDraft(id, build('draft'));
      toast('Assignment draft saved successfully');
    } catch {
      setError('Draft could not be saved. Your modifications are still here; try again.');
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    const value = build('published');
    const err = validate(value);
    if (err) {
      setError(err);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await publishAssignment(id, value);
      toast(`Assignment version ${value.v} published for ${patient.n}!`);
      nav(`/client/patients/${id}`);
    } catch (cause) {
      setError(cause.message || 'Assignment could not be published. Check connection and retry.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Top Header */}
      <div className="row sp" style={{ marginBottom: 16, alignItems: 'flex-start' }}>
        <div>
          <Link to={`/client/patients/${id}`} className="btn s sm" style={{ marginBottom: 8, display: 'inline-flex' }}>
            ← Back to {patient.n}
          </Link>
          <h1 style={{ margin: '4px 0 0' }}>Plan Prescription for {patient.n}</h1>
          <p className="mut" style={{ margin: '4px 0 0', fontSize: 13 }}>
            Prescribe rehabilitation exercises, set joint range of motion (ROM) targets, and configure AI camera tracking.
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn s" disabled={busy} onClick={saveDraft}>
            Save Draft
          </button>
          <button className="btn" disabled={busy || !selectedItems.length} onClick={publish}>
            {busy ? 'Publishing…' : 'Publish Plan'}
          </button>
        </div>
      </div>

      {error && (
        <div className="session-status" role="alert" style={{ marginBottom: 16 }}>
          <b>Notice:</b> {error}
        </div>
      )}

      {/* Plan Settings Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>1. Clinical Assessment &amp; Schedule</h3>
        <div className="grid">
          <div>
            <label htmlFor="assignment-assessment">Linked Clinical Assessment</label>
            <select id="assignment-assessment" value={assessmentKey} onChange={event => setAssessmentKey(event.target.value)}>
              <option value="">Choose a published assessment</option>
              {assessments.map(item => (
                <option key={`${item.assessmentId}:v${item.version}`} value={`${item.assessmentId}:v${item.version}`}>
                  Assessment v{item.version} · {item.assessedAt || 'Recent'}
                </option>
              ))}
            </select>
            {!assessments.length && (
              <p className="mut" style={{ fontSize: 12 }}>
                Publish an assessment on the patient’s detail page before publishing. You can save a draft now.
              </p>
            )}
            {assessment && assessmentIsStale(assessment) && (
              <p role="status" style={{ color: 'var(--warn)', fontSize: 12 }}>
                ⚠️ This assessment is over 8 weeks old. Consider reassessing before publishing.
              </p>
            )}
            {assessment && (
              <p className="mut" style={{ fontSize: 12 }}>
                Restrictions on file: {assessment.restrictions?.join(', ') || 'None recorded'}.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pn">Plan Name</label>
            <input id="pn" type="text" value={planName} placeholder="e.g. Mobility &amp; Strengthening Phase 1" onChange={event => setPlanName(event.target.value)} />
          </div>

          <div>
            <label htmlFor="frequency">Prescribed Sessions / Week</label>
            <input id="frequency" type="number" min="1" max="7" value={frequency} onChange={event => setFrequency(Number(event.target.value))} />
          </div>
        </div>
      </div>

      {/* Exercise Selection Toolbar */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 18px' }}>
        <div className="row sp" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>2. Select &amp; Configure Exercises</h3>
            <p className="mut" style={{ margin: '2px 0 0', fontSize: 12 }}>
              Choose from validated clinical exercises, AI generated protocols, or create custom movements.
            </p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn s sm" onClick={() => { setShowAiGenModal(true); setAiDraft(null); setAiError(''); }}>
              <Icon name="plan" size={16} /> + AI Exercise Generator
            </button>
            <button type="button" className="btn s sm" onClick={() => setShowAddModal(true)}>
              + Add Custom Movement
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <input
            type="search"
            placeholder="🔍 Search exercises by name or joint…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ minWidth: 240, flex: 1, padding: '8px 12px', fontSize: 13 }}
          />

          <div role="group" aria-label="Exercise category filters" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              ['all', `All (${items.length})`],
              ['selected', `Selected (${selectedItems.length})`],
              ['lower', 'Lower Body'],
              ['upper', 'Upper Body'],
              ['mobility', 'Spine & Mobility'],
              ['custom', 'AI / Custom'],
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={`btn s sm ${activeCategory === key ? 'pri' : ''}`}
                style={{
                  background: activeCategory === key ? 'var(--pri)' : 'var(--soft)',
                  color: activeCategory === key ? '#fff' : 'inherit',
                  fontWeight: activeCategory === key ? 700 : 500,
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                }}
                onClick={() => setActiveCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayedExercises.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px', background: 'var(--soft)' }}>
              <p className="mut" style={{ margin: 0 }}>No exercises matched your search.</p>
              <button type="button" className="btn s sm" style={{ marginTop: 8 }} onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                Reset filters
              </button>
            </div>
          ) : (
            displayedExercises.map(item => {
              const refs = approvedReferences(item.ex);
              const meta = exerciseMeta(item.ex);
              const cap = getExerciseCapability(item.ex);
              const isUnmeasured = item.videoOnly || cap.isUnmeasured;
              const isSelected = item.checked;
              const isPreviewOpen = previewingPose === item.ex;

              return (
                <div
                  key={item.ex}
                  className="card"
                  style={{
                    margin: 0,
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: isSelected ? '1.5px solid var(--pri)' : '1px solid var(--card-border)',
                    background: isSelected ? 'var(--card)' : 'var(--soft)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Card Header Row */}
                  <div className="row sp" style={{ flexWrap: 'wrap', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0, fontWeight: 600, fontSize: 16 }}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                        onChange={() =>
                          setItemByEx(item.ex, {
                            checked: !item.checked,
                            referenceVersionId: item.referenceVersionId || refs[0]?.versionId || '',
                          })
                        }
                      />
                      <span>{item.ex}</span>
                    </label>

                    <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <span className="tag" style={{ fontSize: 11, background: 'var(--soft)', border: '1px solid var(--card-border)' }}>
                        {isUnmeasured ? '📖 Guide-Only (Unmeasured)' : `🎥 ${meta.angleLabel} · ${meta.cameraView} view`}
                      </span>
                      {isSelected && (
                        <span className="tag ok" style={{ fontSize: 11 }}>
                          ✓ Prescribed
                        </span>
                      )}
                      <button
                        type="button"
                        className="btn s sm"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => setPreviewingPose(isPreviewOpen ? null : item.ex)}
                      >
                        <Icon name="workout" size={14} />
                        {isPreviewOpen ? 'Hide 3D Pose' : '3D Pose Preview'}
                      </button>
                    </div>
                  </div>

                  {/* 3D Pose Animation Preview Accordion */}
                  {isPreviewOpen && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--card-border)' }}>
                      <Suspense fallback={<div className="session-status">Loading 3D skeleton simulation…</div>}>
                        <ExerciseAnimationPreview
                          descriptor={{
                            id: `illustration-${item.ex.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                            exerciseName: item.ex,
                          }}
                          initialPeak={item.targetExcursionDeg}
                          compact
                        />
                      </Suspense>
                    </div>
                  )}

                  {/* Expanded Configuration when Selected */}
                  {isSelected && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--card-border)' }}>
                      <div className="grid" style={{ gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600 }}>Target Repetitions</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={item.targetReps}
                            onChange={e => setItemByEx(item.ex, { targetReps: Number(e.target.value) })}
                          />
                        </div>

                        {isUnmeasured ? (
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600 }}>Tracking Capability</label>
                            <p className="mut" style={{ margin: '6px 0 0', fontSize: 13 }}>
                              Guided movement — unmeasured by camera. The patient follows step-by-step instructions.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600 }}>Target ROM / Movement ({meta.angleLabel})</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input
                                type="number"
                                min="1"
                                max="180"
                                value={item.targetExcursionDeg}
                                onChange={e => setItemByEx(item.ex, { targetExcursionDeg: Number(e.target.value) })}
                              />
                              <span style={{ fontSize: 14, fontWeight: 700 }}>deg°</span>
                            </div>
                          </div>
                        )}

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600 }}>Time Limit (Seconds)</label>
                          <input
                            type="number"
                            min="10"
                            max="1800"
                            value={item.t}
                            onChange={e => setItemByEx(item.ex, { t: Number(e.target.value) })}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600 }}>Approved Reference / Demo</label>
                          <select
                            value={item.referenceVersionId}
                            onChange={e => setItemByEx(item.ex, { referenceVersionId: e.target.value })}
                          >
                            {refs.map(r => (
                              <option key={r.versionId} value={r.versionId}>
                                {r.isSynthetic ? 'Synthetic 3D Pose Reference (Approved)' : `Version ${r.version} · ${r.cameraView} camera view`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <label style={{ fontSize: 12, fontWeight: 600 }}>Clinical Instructions &amp; Form Cues for Patient</label>
                        <textarea
                          rows="2"
                          placeholder="e.g. Move slowly through full range, exhale on effort. Stop if pain occurs."
                          value={item.note}
                          onChange={e => setItemByEx(item.ex, { note: e.target.value })}
                          style={{ width: '100%', fontSize: 13 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Plan Summary & Review Card */}
      <div className="card" style={{ marginTop: 24, padding: '20px 22px' }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>3. Prescription Summary &amp; Publishing</h3>
        <p className="mut" style={{ margin: '0 0 16px', fontSize: 13 }}>
          {assessment ? `Linked to assessment v${assessment.version} (${assessment.assessedAt || 'Recent'}).` : 'No assessment selected.'}
          {' '}Publishing generates an immutable version v{(current?.v ?? 0) + 1} for {patient.n}.
        </p>

        <div className="grid" style={{ marginBottom: 16 }}>
          <div className="card" style={{ margin: 0, background: 'var(--soft)', padding: 14 }}>
            <span className="eyebrow">SELECTED MOVEMENTS</span>
            <b style={{ fontSize: 20, display: 'block', marginTop: 4 }}>{selectedItems.length} Exercises</b>
            <span className="mut" style={{ fontSize: 12 }}>{selectedItems.map(i => i.ex).join(', ') || 'None selected'}</span>
          </div>

          <div className="card" style={{ margin: 0, background: 'var(--soft)', padding: 14 }}>
            <span className="eyebrow">TOTAL REPS / SESSION</span>
            <b style={{ fontSize: 20, display: 'block', marginTop: 4 }}>
              {selectedItems.reduce((acc, i) => acc + (i.targetReps || 0), 0)} Reps
            </b>
            <span className="mut" style={{ fontSize: 12 }}>Estimated workout time: ~{Math.ceil(selectedItems.reduce((acc, i) => acc + (i.t || 45), 0) / 60)} min</span>
          </div>

          <div className="card" style={{ margin: 0, background: 'var(--soft)', padding: 14 }}>
            <span className="eyebrow">WEEKLY FREQUENCY</span>
            <b style={{ fontSize: 20, display: 'block', marginTop: 4 }}>{frequency} Sessions / Week</b>
            <span className="mut" style={{ fontSize: 12 }}>Total ~{frequency * selectedItems.reduce((acc, i) => acc + (i.targetReps || 0), 0)} reps weekly</span>
          </div>
        </div>

        <p className="mut" style={{ fontSize: 12, marginBottom: 16 }}>
          ℹ️ Kineticare Clinical Disclaimer: Camera measurements are biomechanical estimates. AI drafts and customized protocols require prescribing clinician review prior to publishing.
        </p>

        <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
          <button className="btn" disabled={busy || !selectedItems.length} onClick={publish} style={{ minWidth: 200 }}>
            {busy ? 'Publishing…' : 'Publish Patient Plan'}
          </button>
          <button className="btn s" disabled={busy} onClick={saveDraft}>
            Save Draft
          </button>
        </div>
      </div>

      {/* Modal: AI Exercise Generator */}
      {showAiGenModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div className="card" style={{ maxWidth: 540, width: '100%', padding: '24px 22px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="row sp" style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>AI Exercise Generator (Gemini)</h2>
              <button type="button" className="btn s sm" onClick={() => setShowAiGenModal(false)}>✕</button>
            </div>

            {aiDraft ? (
              <div>
                <div className="row sp" style={{ marginBottom: 8 }}>
                  <h3 style={{ margin: 0 }}>{aiDraft.exercise?.name}</h3>
                  <span className="tag warn">Clinician Review Required</span>
                </div>
                <p style={{ marginTop: 4, fontSize: 14 }}>{aiDraft.exercise?.description}</p>

                <h4>Prescribed Movement Steps</h4>
                <ol style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.5 }}>
                  {aiDraft.exercise?.steps?.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>{step}</li>
                  ))}
                </ol>

                <h4>Precautions to Verify</h4>
                <ul style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.5, color: 'var(--warn)' }}>
                  {aiDraft.exercise?.precautions?.map((prec, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>{prec}</li>
                  ))}
                </ul>

                <p className="mut" style={{ fontSize: 12 }}>
                  Source: {aiDraft.reference} · Model: {aiDraft.model || 'Gemini'}
                </p>

                <div className="card" style={{ background: 'var(--soft)', fontSize: 12, margin: '14px 0' }}>
                  ℹ️ <b>Capability Note:</b> AI generated movements are added to the patient’s plan as guided protocols with instructions and demonstration. Real-time joint angle camera tracking is disabled for novel movements to maintain diagnostic validity.
                </div>

                <div className="row sp" style={{ gap: 8 }}>
                  <button type="button" className="btn s" onClick={() => setAiDraft(null)}>Discard Draft</button>
                  <button type="button" className="btn" onClick={approveAiDraftAndAdd}>Approve &amp; Add to Plan</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAiGenerate}>
                <p className="mut" style={{ fontSize: 13, marginTop: 0 }}>
                  Draft evidence-grounded exercise education for clinician review. Drafts are verified before being added to the patient’s plan.
                </p>

                {aiError && (
                  <div className="session-status" role="alert" style={{ marginBottom: 12 }}>
                    {aiError}
                  </div>
                )}

                <label htmlFor="ai-gen-brief">Exercise Brief or Movement Goal</label>
                <textarea
                  id="ai-gen-brief"
                  rows="2"
                  required
                  placeholder="e.g. Scapular retractions and gentle elevation within 60 degrees pain-free range"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  style={{ width: '100%', marginBottom: 12 }}
                />

                <label htmlFor="ai-gen-reference">Clinical Reference &amp; Edition</label>
                <input
                  id="ai-gen-reference"
                  type="text"
                  required
                  value={aiReference}
                  onChange={e => setAiReference(e.target.value)}
                  style={{ width: '100%', marginBottom: 12 }}
                />

                <label htmlFor="ai-gen-notes">Clinician Reference Summary / Rationale</label>
                <textarea
                  id="ai-gen-notes"
                  rows="3"
                  required
                  placeholder="Summarize the relevant biomechanical principles, contraindications, or movement cues..."
                  value={aiReferenceNotes}
                  onChange={e => setAiReferenceNotes(e.target.value)}
                  style={{ width: '100%', marginBottom: 12 }}
                />

                <label className="check-label" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '10px 0 16px', fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={aiConsent}
                    onChange={e => setAiConsent(e.target.checked)}
                  />
                  <span>
                    I confirm no identifiable patient data is included in this brief, and consent to query Gemini for educational exercise drafting.
                  </span>
                </label>

                <div className="row sp">
                  <button type="button" className="btn s" onClick={() => setShowAiGenModal(false)}>Cancel</button>
                  <button type="submit" className="btn" disabled={aiGenerating || !aiPrompt.trim() || !aiConsent}>
                    {aiGenerating ? 'Generating Draft…' : 'Generate Exercise Draft'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Custom Movement Creator */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div className="card" style={{ maxWidth: 500, width: '100%', padding: '24px 22px' }}>
            <div className="row sp" style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Add Custom Exercise</h2>
              <button type="button" className="btn s sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddCustom}>
              <label htmlFor="custom-name">Exercise Name</label>
              <input
                id="custom-name"
                type="text"
                required
                placeholder="e.g. Reverse Lunge"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                style={{ width: '100%', marginBottom: 12 }}
              />

              <div className="grid" style={{ marginBottom: 14 }}>
                <div>
                  <label htmlFor="custom-joint">Primary Joint</label>
                  <select id="custom-joint" value={customJoint} onChange={e => setCustomJoint(e.target.value)}>
                    <option value="knee">Knee (Flexion / Extension)</option>
                    <option value="shoulder">Shoulder (Abduction / Elevation)</option>
                    <option value="hip">Hip (Flexion / Bend)</option>
                    <option value="ankle">Ankle (Plantarflexion / Heel)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="custom-angle">Target Movement (°)</label>
                  <input
                    id="custom-angle"
                    type="number"
                    min="1"
                    max="180"
                    value={customAngle}
                    onChange={e => setCustomAngle(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="custom-view">Camera View</label>
                  <select id="custom-view" value={customView} onChange={e => setCustomView(e.target.value)}>
                    <option value="side">Side View (Knee/Hip/Ankle)</option>
                    <option value="front">Front View (Shoulders/Bilateral)</option>
                  </select>
                </div>
              </div>

              <div className="row sp">
                <button type="button" className="btn s" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={!customName.trim()}>Add to Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
