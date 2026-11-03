import { useState, useEffect, useRef } from 'react';
import { useRecords } from '../records/recordsContext';
import { useAuth } from '../auth/authContext';
import { getChatStatus, sendChat, getChatHistory, clearChatHistory } from '../services/chatApi';
import Icon from '../components/Icon';
import FormattedAiMessage from '../components/FormattedAiMessage';
import '../patient/PatientAiPhysio.css';

const CLINICIAN_PROMPTS = [
  'Summarise recent session compliance and volume across my patient roster.',
  'Which patients have sessions waiting for clinical review and feedback?',
  'Draft thoughtful, encouraging clinical feedback for recently submitted sessions.',
  'Identify any patients showing irregular form scores or movement deficits.',
  'Suggest exercise regressions for patients struggling with squat depth.',
];

export default function ClientAiCopilot() {
  const { user } = useAuth();
  const { workspace } = useRecords();
  const patients = workspace?.patients || [];
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const [hasConsent, setHasConsent] = useState(() => {
    try {
      return localStorage.getItem('kineticare_ai_chat_consent') === 'true';
    } catch {
      return false;
    }
  });

  const [configured, setConfigured] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    let active = true;
    getChatStatus().then(st => {
      if (active) setConfigured(st.configured);
    });
    getChatHistory().then(res => {
      if (active && Array.isArray(res?.messages) && res.messages.length > 0) {
        setMessages(res.messages);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const giveConsent = () => {
    try {
      localStorage.setItem('kineticare_ai_chat_consent', 'true');
    } catch {
      /* ignore storage failure */
    }
    setHasConsent(true);
  };

  const handleClear = async () => {
    await clearChatHistory();
    setMessages([]);
    setError(null);
  };

  const handleSend = async (textToSend, baseMessages = null) => {
    if (sendingRef.current) return;
    const text = (typeof textToSend === 'string' ? textToSend : input).trim();
    if (!text) return;

    sendingRef.current = true;
    const currentMessages = baseMessages ?? messages;
    const userMsg = { role: 'user', content: text };
    const nextMessages = [...currentMessages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const payloadMessages = nextMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.role === 'assistant' && m.content.length > 7900 ? m.content.slice(0, 7900) : m.content,
      }));
      const res = await sendChat(payloadMessages, { patientId: selectedPatientId });
      setMessages([...nextMessages, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      setError(err.message || 'Unable to connect to Clinician Copilot.');
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="physio-page" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div className="physio-header">
        <div className="physio-header-identity">
          <div className="physio-avatar-mark" style={{ background: 'var(--pri)' }}>
            <Icon name="physio" size={24} color="#ffffff" />
          </div>
          <div className="physio-header-text">
            <div className="physio-title-row">
              <h1>Clinician Intelligence Copilot</h1>
              <span className="physio-role-chip">CLINICAL PRACTICE SUPPORT</span>
            </div>
            <p>
              <span className="physio-dot green" />
              {configured !== false ? 'Groq AI Copilot Active (Kisner & Colby Grounded)' : 'Offline / Mock'}
            </p>
          </div>
        </div>
        <div className="physio-header-actions">
          {messages.length > 0 && (
            <button
              type="button"
              className="physio-clear-btn"
              onClick={handleClear}
            >
              Clear Workspace
            </button>
          )}
        </div>
      </div>

      {/* Patient Focus Selector Bar */}
      <div className="physio-context-card" style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label htmlFor="patient-focus-select" style={{ fontSize: 13, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>
              Focus Context:
            </label>
            <select
              id="patient-focus-select"
              value={selectedPatientId || ''}
              onChange={(e) => setSelectedPatientId(e.target.value || null)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--ink)', fontSize: 13 }}
            >
              <option value="">All Linked Patients (Cohort Overview)</option>
              {patients.map(p => (
                <option key={p.id || p.uid} value={p.id || p.uid}>
                  {p.n || p.name || p.displayName || p.email} ({p.condition || 'Rehab'})
                </option>
              ))}
            </select>
          </div>
          <span style={{ fontSize: 12, color: 'var(--mut)' }}>
            Context includes only authorized patient data &amp; telemetry
          </span>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div className="physio-chat-box">
        {!hasConsent ? (
          <div className="physio-consent-screen">
            <div className="physio-consent-card">
              <div className="physio-consent-icon">
                <Icon name="shield" size={32} color="var(--pri)" />
              </div>
              <h2>Clinician AI Copilot Notice</h2>
              <p>
                The Clinician Intelligence Copilot analyzes your authorized patient roster, telemetry trends, and therapeutic exercise protocols to draft clinical feedback, synthesize progress notes, and suggest evidence-based exercise progressions.
              </p>
              <ul className="physio-consent-bullets">
                <li>
                  <strong>Clinician Oversight:</strong> All AI-generated exercise suggestions, progress notes, and feedback drafts remain advisory and require clinician review before being assigned to patients.
                </li>
                <li>
                  <strong>Data Privacy:</strong> Queries are scoped strictly to patients who have granted active sharing consent. No raw video is ever processed or stored.
                </li>
              </ul>
              <button
                type="button"
                className="btn physio-consent-btn"
                onClick={giveConsent}
              >
                Accept &amp; Open Copilot
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="physio-messages-area">
              {messages.length === 0 && (
                <div className="physio-empty-welcome">
                  <div className="physio-empty-avatar" style={{ background: 'var(--pri)' }}>
                    <Icon name="physio" size={32} color="#ffffff" />
                  </div>
                  <h3>Clinician Clinical Intelligence</h3>
                  <p>
                    I can help you review patient workout telemetry, draft personalized feedback, or generate educational exercise protocols. Choose a prompt or ask a custom question below:
                  </p>
                  <div className="physio-prompts-grid">
                    {CLINICIAN_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="physio-quick-card"
                        onClick={() => handleSend(prompt)}
                      >
                        <div className="physio-card-icon">
                          <Icon name="zap" size={16} />
                        </div>
                        <div className="physio-card-text">
                          <strong>{prompt.split(' ')[0]} {prompt.split(' ')[1]}...</strong>
                          <small>{prompt}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, idx) => (
                <div key={idx} className={`physio-msg-row ${m.role}`}>
                  <div className="physio-msg-avatar" aria-hidden="true" style={m.role === 'assistant' ? { background: 'var(--pri)' } : {}}>
                    {m.role === 'assistant' ? (
                      <Icon name="physio" size={16} color="#ffffff" />
                    ) : (
                      user?.displayName?.[0]?.toUpperCase() || 'Dr'
                    )}
                  </div>
                  <div className="physio-msg-body">
                    {m.role === 'assistant' && (
                      <div className="physio-msg-author">
                        <span className="physio-author-name">Clinician Copilot</span>
                        <span className="physio-author-badge">Kisner &amp; Colby Grounded</span>
                      </div>
                    )}
                    <div className="physio-bubble">
                      <FormattedAiMessage content={m.content} role={m.role} />
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="physio-msg-row assistant">
                  <div className="physio-msg-avatar" aria-hidden="true" style={{ background: 'var(--pri)' }}>
                    <Icon name="physio" size={16} color="#ffffff" />
                  </div>
                  <div className="physio-msg-body">
                    <div className="physio-msg-author">
                      <span className="physio-author-name">Clinician Copilot</span>
                      <span className="physio-author-badge">Analyzing patient data...</span>
                    </div>
                    <div className="physio-bubble typing">
                      <div className="physio-typing-indicator" aria-label="Copilot is analyzing">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="physio-error-banner" role="alert">
                  <span>⚠️ {error}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const lastUserIdx = messages.findLastIndex(m => m.role === 'user');
                      if (lastUserIdx !== -1) {
                        const prior = messages.slice(0, lastUserIdx);
                        handleSend(messages[lastUserIdx].content, prior);
                      }
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="physio-composer-area">
              <div className="physio-input-wrap">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about patient compliance, exercise biomechanics, or draft feedback..."
                  rows={2}
                  maxLength={1500}
                  disabled={loading}
                  aria-label="Message to Clinician Copilot"
                />
                <button
                  type="button"
                  className="physio-send-btn"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                >
                  <Icon name="send" size={18} color="#ffffff" />
                </button>
              </div>
              <div className="physio-disclaimer-subtext">
                Clinical advisory suggestions only. Clinician retains full authority over exercise prescription.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
