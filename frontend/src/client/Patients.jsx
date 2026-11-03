import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecords } from '../records/recordsContext';
import CareConnection from '../components/CareConnection';
import Icon from '../components/Icon';
import { Card, Badge, SearchInput, Button, EmptyState } from '../components/SharedUI';

export default function ClientPatients() {
  const { workspace, sessions, requests, assignment } = useRecords();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'needs-review' | 'requests'
  const [showInviteSection, setShowInviteSection] = useState(false);
  const nav = useNavigate();

  const patients = workspace.patients || [];

  // Summary counts
  const pendingReviewsCount = useMemo(() => {
    return patients.reduce((acc, p) => {
      const pSessions = sessions(p.id) || [];
      return acc + pSessions.filter(s => s.reviewStatus !== 'reviewed').length;
    }, 0);
  }, [patients, sessions]);

  const openRequestsCount = useMemo(() => {
    return patients.reduce((acc, p) => {
      const pReqs = requests(p.id) || [];
      return acc + pReqs.filter(r => r.status === 'open').length;
    }, 0);
  }, [patients, requests]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesQuery = (patient.n + ' ' + (patient.email || '')).toLowerCase().includes(query.toLowerCase());
      if (!matchesQuery) return false;

      const pSessions = sessions(patient.id) || [];
      const hasPending = pSessions.some(s => s.reviewStatus !== 'reviewed');
      const pReqs = requests(patient.id) || [];
      const hasRequests = pReqs.some(r => r.status === 'open');

      if (filter === 'needs-review') return hasPending;
      if (filter === 'requests') return hasRequests;
      return true;
    });
  }, [patients, query, filter, sessions, requests]);

  return (
    <div className="client-patients-view">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CARE DIRECTORY</p>
          <h1>Your Patients</h1>
          <p className="mut">Manage linked patients, track rehabilitation adherence, and review movement telemetry.</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Button
            variant={showInviteSection ? 'secondary' : 'primary'}
            onClick={() => setShowInviteSection(!showInviteSection)}
          >
            <Icon name="me" size={16} />
            {showInviteSection ? 'Hide Invitations' : 'Invite Patient'}
          </Button>
        </div>
      </div>

      {showInviteSection && (
        <div style={{ marginBottom: 24 }}>
          <CareConnection />
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid overview-stats" style={{ marginBottom: 24 }}>
        <div className="card">
          <span className="stat-icon"><Icon name="me" /></span>
          <div className="stat">{patients.length}</div>
          Total Linked Patients
        </div>
        <div className="card">
          <span className="stat-icon"><Icon name="prog" /></span>
          <div className="stat" style={{ color: pendingReviewsCount > 0 ? 'var(--warn)' : 'var(--ok)' }}>
            {pendingReviewsCount}
          </div>
          Sessions Needing Review
        </div>
        <div className="card">
          <span className="stat-icon"><Icon name="fb" /></span>
          <div className="stat" style={{ color: openRequestsCount > 0 ? 'var(--warn)' : 'inherit' }}>
            {openRequestsCount}
          </div>
          Open Patient Inquiries
        </div>
        <div className="card">
          <div className="stat" style={{ fontSize: 20, color: 'var(--pri)' }}>
            {patients.filter(p => (sessions(p.id) || []).length > 0).length}
          </div>
          Active Rehabilitating
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div className="row sp" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: '1 1 280px', maxWidth: 420 }}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search patients by name or email…"
              aria-label="Search linked patients"
            />
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button
              className={`btn sm ${filter === 'all' ? '' : 's'}`}
              onClick={() => setFilter('all')}
            >
              All Patients ({patients.length})
            </button>
            <button
              className={`btn sm ${filter === 'needs-review' ? '' : 's'}`}
              onClick={() => setFilter('needs-review')}
            >
              Needs Review {pendingReviewsCount > 0 && `(${pendingReviewsCount})`}
            </button>
            <button
              className={`btn sm ${filter === 'requests' ? '' : 's'}`}
              onClick={() => setFilter('requests')}
            >
              Inquiries {openRequestsCount > 0 && `(${openRequestsCount})`}
            </button>
          </div>
        </div>
      </div>

      {/* Patient List */}
      {filteredPatients.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredPatients.map(patient => {
            const pSessions = sessions(patient.id) || [];
            const latestSession = pSessions.at(-1);
            const pendingCount = pSessions.filter(s => s.reviewStatus !== 'reviewed').length;
            const pReqs = requests(patient.id) || [];
            const openReqs = pReqs.filter(r => r.status === 'open');
            const patientPlan = assignment(patient.id);

            const initials = (patient.n || 'Patient')
              .split(' ')
              .map(p => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Card key={patient.id} hoverable style={{ padding: '18px 20px' }}>
                <div className="row sp" style={{ flexWrap: 'wrap', gap: 14 }}>
                  <div className="row" style={{ gap: 16, alignItems: 'center' }}>
                    <div
                      className="av"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: 'var(--pri2)',
                        color: 'var(--pri)',
                        fontWeight: 600,
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--card-border)',
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{patient.n}</h3>
                        {patient.a && <span className="mut" style={{ fontSize: 13 }}>· {patient.a}</span>}
                      </div>
                      <div className="mut" style={{ fontSize: 13, marginTop: 2 }}>
                        {patient.email}
                      </div>
                      <div className="row" style={{ gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                        {patientPlan ? (
                          <Badge variant="teal">Plan: {patientPlan.name || 'Assigned'}</Badge>
                        ) : (
                          <Badge variant="gray">Self-Guided Protocol</Badge>
                        )}
                        {latestSession ? (
                          <span className="mut" style={{ fontSize: 12 }}>
                            Last session: {latestSession.d}
                          </span>
                        ) : (
                          <span className="mut" style={{ fontSize: 12 }}>
                            No sessions recorded yet
                          </span>
                        )}
                        {openReqs.length > 0 && (
                          <Badge variant="amber">{openReqs.length} open message{openReqs.length > 1 ? 's' : ''}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                    {pendingCount > 0 ? (
                      <Badge variant="amber">{pendingCount} to review</Badge>
                    ) : latestSession ? (
                      <Badge variant="green">Up to date</Badge>
                    ) : null}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => nav(`/client/patients/${encodeURIComponent(patient.id)}/assign`)}
                    >
                      Plan
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => nav(`/client/patients/${encodeURIComponent(patient.id)}`)}
                    >
                      Open Chart ↗
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : patients.length > 0 ? (
        <EmptyState
          title="No patients match your search"
          description={`No linked patients found matching "${query}".`}
          action={<Button variant="secondary" size="sm" onClick={() => { setQuery(''); setFilter('all'); }}>Clear search filters</Button>}
        />
      ) : (
        <EmptyState
          title="No linked patients yet"
          description="Patients will appear in this directory once they accept your invitation or link using your clinician invite code."
          action={
            <Button variant="primary" onClick={() => setShowInviteSection(true)}>
              Invite Your First Patient
            </Button>
          }
        />
      )}
    </div>
  );
}
