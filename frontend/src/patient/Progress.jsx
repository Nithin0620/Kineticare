import { useRecords } from '../records/recordsContext';
import { avg, calcLongitudinalTrends } from '../metrics';
import { LineChart, KPIs, DemoBanner } from '../utils';
import ScoreTimeCharts from '../components/ExerciseCharts';
import { workoutStreak } from '../patientFlow';

export default function PatientProgress() {
  const { patientId, sessions, patientPlan, backend } = useRecords();
  const history = sessions(patientId);
  const streak = workoutStreak(history);
  const plan = patientPlan(patientId);
  const measured = history.filter(session => session.mode !== 'replay');
  const scored = measured.filter(session => Number.isFinite(avg(session.r)));
  const trends = calcLongitudinalTrends(history);

  return (
    <>
      <h1>Progress & Recovery</h1>
      {backend === 'local-demo' && <DemoBanner />}
      <div className="card"><h3>{streak.current} day streak · Best {streak.best} days</h3><p className="mut">One completed live workout per calendar day. Partial sessions and replays are excluded; follow prescribed rest days.</p></div>

      <KPIs ss={measured} />

      {/* Recovery Highlights */}
      {trends && (
        <div className="card st4">
          <div><b>{trends.totalRepsCompleted}</b>Total Reps</div>
          <div><b>{trends.totalActiveMinutes}m</b>Rehab Active Time</div>
          <div><b>{history.filter(session => session.status === 'completed' && session.mode !== 'replay').length}</b>Completed Sessions</div>
          <div><b>{plan?.items?.length ?? 0}</b>Active Exercises</div>
        </div>
      )}

            {/* Joint Range of Motion (ROM) Trajectory */}
      {trends && Object.keys(trends.exerciseTrends).length > 0 && (
        <div className="card">
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ margin: '0 0 4px' }}>Joint Mobility Trajectory (ROM in Degrees)</h3>
            <p className="mut" style={{ fontSize: 13, margin: 0 }}>Track your physical range of motion progress over each workout.</p>
          </div>
          {Object.entries(trends.exerciseTrends).map(([exercise, points]) => (
            <div key={exercise} style={{ margin: '16px 0 20px', padding: '14px 16px', background: 'var(--soft)', borderRadius: 12, border: '1px solid var(--card-border)' }}>
              <div className="row sp" style={{ marginBottom: 16 }}>
                <b style={{ fontSize: 14 }}>{exercise}</b>
                <span className="tag ok" style={{ fontSize: 11 }}>Target: {points[0]?.targetDeg}°</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 110, paddingBottom: 4 }}>
                {points.map((pt, idx) => {
                  const target = pt.targetDeg || 45;
                  const maxH = 60;
                  const barH = Math.min(maxH, Math.round((pt.meanPeakDeg / (target * 1.3)) * maxH));
                  const met = pt.meanPeakDeg >= target * 0.9;
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 52,
                          minWidth: 28,
                          height: Math.max(8, barH),
                          background: 'var(--pri)',
                          opacity: met ? 1 : 0.45,
                          borderRadius: '6px 6px 0 0',
                          marginBottom: 8,
                          transition: 'height 0.3s ease',
                        }}
                      />
                      <b style={{ fontSize: 12, lineHeight: 1.2, color: 'var(--ink)' }}>{pt.meanPeakDeg}°</b>
                      <span className="mut" style={{ fontSize: 11, marginTop: 2 }}>{pt.date.slice(0, 6)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3>Functional Movement Score by session</h3>
        <LineChart vals={scored.map(session => avg(session.r))} labs={scored.map(session => session.d.slice(0, 6))} />
        <p className="mut">0–100 movement quality index based on range compliance and tempo smoothness.</p>
      </div>

      <ScoreTimeCharts results={measured.flatMap(session => session.r || [])} scoreTitle="Average score for each exercise" timeTitle="Average time in seconds for each exercise" />

      <div className="card">
        <h3>Rehabilitation Adherence</h3>
        <p>{history.length} saved session{history.length === 1 ? '' : 's'} for {plan?.name ?? 'the current account'}.</p>
        <p className="mut">Regular practice between clinical consultations builds joint stability and accelerates recovery.</p>
      </div>

      <h2>Session History</h2>
      {history.slice().reverse().map(session => (
        <div key={session.sessionId ?? session.d} className="card">
          <div className="row sp">
            <b>{session.d}</b>
              <span className={`tag ${session.status === 'partial' || session.mode === 'replay' ? 'warn' : 'ok'}`}>{session.mode === 'replay' ? 'Replay · ' : ''}{session.status ?? 'completed'}</span>
          </div>
          <p className="mut" style={{ margin: '6px 0 0' }}>
            {(session.r || []).map(result => `${result.ex}: ${result.t || 0}s`).join(' · ')}
          </p>
        </div>
      ))}
    </>
  );
}
