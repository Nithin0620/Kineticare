import { ALL_EXERCISES } from '../data';

const SHORT_EXERCISE_NAMES = {
  'Squat': 'Squat',
  'Side Arm Raise': 'Arm Raise',
  'Toe Touch': 'Toe Touch',
  'Bilateral mini-squat': 'Mini-Squat',
  'Standing wall slide': 'Wall Slide',
  'Bilateral standing heel raise': 'Heel Raise',
  'Standing full-can scapular-plane elevation': 'Scapular Elev.',
  'Forward step-up and step-down': 'Step-Up',
  'Modified supine bridge': 'Supine Bridge',
  'Standing resisted shoulder external rotation': 'Shoulder Ext.',
  'Assisted eccentric heel lowering': 'Heel Lowering',
};

function formatExerciseName(name) {
  if (!name) return '';
  if (SHORT_EXERCISE_NAMES[name]) return SHORT_EXERCISE_NAMES[name];
  const cleaned = name
    .replace(/^Side\s+/i, '')
    .replace(/^Standing\s+/i, '')
    .replace(/^Bilateral\s+/i, '')
    .replace(/^Modified\s+/i, '')
    .replace(/^Assisted\s+/i, '');
  return cleaned.length > 14 ? `${cleaned.slice(0, 12)}…` : cleaned;
}

function BarChart({ title, rows = [], max = 0 }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: 6 }}>{title}</h3>
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mut)', fontSize: 13 }}>
          No exercise data recorded
        </div>
      </div>
    );
  }

  const n = rows.length;
  // If more than 2 items, or if labels are long, angle them to avoid any overlap
  const shouldRotate = n > 2 || rows.some(r => r.label.length > 8);
  const slotWidth = Math.max(76, Math.floor(340 / n));
  const W = Math.max(340, n * slotWidth + 40);
  const H = shouldRotate ? 220 : 185;
  const base = 140;
  const top = 26;
  const L = 20;
  const bw = Math.min(36, Math.max(16, slotWidth * 0.42));
  const scale = Math.max(max, ...rows.map(row => row.value), 1);

  return (
    <div className="card">
      <h3 style={{ marginBottom: 6 }}>{title}</h3>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', maxWidth: 520, height: 'auto', display: 'block' }}
        role="img"
        aria-label={`${title}: ${rows.map(row => `${row.label} ${row.text}`).join(', ')}`}
      >
        {[0, 0.5, 1].map(fraction => {
          const y = base - (base - top) * fraction;
          return <line key={fraction} x1={L} x2={W - L} y1={y} y2={y} stroke="#8883" strokeDasharray={fraction === 0 ? 'none' : '4 3'} />;
        })}
        {rows.map((row, index) => {
          const xCenter = L + index * slotWidth + slotWidth / 2;
          const x = xCenter - bw / 2;
          const height = (base - top) * row.value / scale;
          const barHeight = row.value > 0 ? Math.max(height, 4) : 4;
          return (
            <g key={row.fullName || row.label}>
              <title>{`${row.fullName || row.label}: ${row.text}`}</title>
              <rect
                x={x}
                y={base - barHeight}
                width={bw}
                height={barHeight}
                rx={Math.min(6, bw / 2)}
                fill="var(--pri)"
                opacity={row.value > 0 ? 1 : 0.25}
              />
              <text
                x={xCenter}
                y={Math.max(top - 2, base - barHeight - 6)}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="var(--ink)"
              >
                {row.text}
              </text>
              {shouldRotate ? (
                <g transform={`translate(${xCenter}, ${base + 14}) rotate(-35)`}>
                  <text
                    x={0}
                    y={0}
                    textAnchor="end"
                    fontSize="11"
                    fontWeight="600"
                    fill="var(--mut)"
                  >
                    {row.label}
                  </text>
                </g>
              ) : (
                <text
                  x={xCenter}
                  y={base + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="var(--mut)"
                >
                  {row.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// results: [{ ex, s (0 to 1 or null), t (seconds) }]. Repeated exercises are averaged.
function exerciseSummary(results = [], exercises) {
  return exercises.map(exercise => {
    const matches = results.filter(result => result.ex === exercise);
    const scored = matches.filter(result => Number.isFinite(result.s));
    return {
      exercise,
      score: scored.length ? Math.round(100 * scored.reduce((total, result) => total + result.s, 0) / scored.length) : null,
      time: matches.length ? +(matches.reduce((total, result) => total + (result.t ?? 0), 0) / matches.length).toFixed(1) : 0,
      done: matches.length > 0,
    };
  });
}

export default function ScoreTimeCharts({ results = [], scoreTitle = 'Score for each exercise', timeTitle = 'Time in seconds for each exercise', exercises }) {
  const recordedExercises = Array.from(new Set((results || []).map(r => r?.ex).filter(Boolean)));
  const targetExercises = (exercises && exercises.length > 0)
    ? exercises
    : (recordedExercises.length > 0 ? recordedExercises : ALL_EXERCISES);

  const rows = exerciseSummary(results || [], targetExercises);
  return (
    <>
      <BarChart
        title={scoreTitle}
        max={100}
        rows={rows.map(row => ({
          label: formatExerciseName(row.exercise),
          fullName: row.exercise,
          value: row.score ?? 0,
          text: row.score == null ? (row.done ? 'n/a' : '0') : String(row.score),
        }))}
      />
      <BarChart
        title={timeTitle}
        rows={rows.map(row => ({
          label: formatExerciseName(row.exercise),
          fullName: row.exercise,
          value: row.time,
          text: String(row.time),
        }))}
      />
    </>
  );
}
