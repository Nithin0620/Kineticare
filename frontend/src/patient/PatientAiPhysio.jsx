import { useState, useEffect, useRef } from 'react';
import { useRecords } from '../records/recordsContext';
import { useAuth } from '../auth/authContext';
import { getChatStatus, sendChat, getChatHistory, clearChatHistory } from '../services/chatApi';
import Icon from '../components/Icon';
import FormattedAiMessage from '../components/FormattedAiMessage';
import './PatientAiPhysio.css';

const CONVERSATION_STARTERS = [
  {
    id: 'form',
    label: 'Form & Biomechanics',
    icon: 'compass',
    desc: 'Alignment cues & common substitutions to avoid',
    prompt: 'According to Kisner & Colby exercise principles, what are the exact biomechanical alignment cues and common substitutions to avoid during my exercises?',
  },
  {
    id: 'pain',
    label: 'Pain & Soreness Check',
    icon: 'pulse',
    desc: 'Differentiating DOMS from joint inflammation or strain',
    prompt: 'I feel some soreness after my session. Applying Kisner & Colby soreness rules, help me differentiate delayed-onset muscle soreness (DOMS) from joint inflammation or strain.',
  },
  {
    id: 'phases',
    label: 'Tissue Healing & Recovery',
    icon: 'shield',
    desc: 'Acute, subacute, and chronic exercise progression',
    prompt: 'Explain the three phases of tissue healing (acute, subacute, chronic) from Kisner & Colby and how my rehabilitation exercise intensity progresses.',
  },
  {
    id: 'warmup',
    label: 'Warm-Up & Mobility',
    icon: 'zap',
    desc: 'Tailored dynamic preparation for assigned exercises',
    prompt: 'Provide a tailored dynamic warm-up and mobility routine for my assigned rehabilitation exercises based on therapeutic exercise protocols.',
  },
  {
    id: 'prog',
    label: 'Plan & Score Review',
    icon: 'target',
    desc: 'Understanding how excursion scores are calculated',
    prompt: 'How is my exercise excursion score calculated and what should I focus on to improve my movement quality?',
  },
];

export default function PatientAiPhysio() {
  const { user } = useAuth();
  const { patientId, patientPlan, assignment, sessions, feedback } = useRecords();

  const plan = patientPlan(patientId);
  const activeAssignment = assignment(patientId);
  const sessionList = sessions(patientId) || [];
  const feedbackList = feedback(patientId) || [];

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
  const [contextExpanded, setContextExpanded] = useState(false);

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
      // Storage unavailable or disabled
    }
    setHasConsent(true);
  };

  const handleClear = async () => {
    await clearChatHistory();
    setMessages([]);
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
      const res = await sendChat(payloadMessages);
      const fullReply = res.reply || '';
      // Simulate token streaming by revealing text progressively
      const CHUNK = 18;
      let revealed = 0;
      const streamMsg = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, streamMsg]);
      setLoading(false);
      await new Promise(resolve => {
        const tick = () => {
          revealed = Math.min(revealed + CHUNK, fullReply.length);
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: fullReply.slice(0, revealed) };
            return updated;
          });
          if (revealed < fullReply.length) {
            setTimeout(tick, 22);
          } else {
            resolve();
          }
        };
        tick();
      });
    } catch (err) {
      setError(err.message || 'Unable to connect to Kira.');
      setLoading(false);
    } finally {
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
    <div className="physio-page">
      {/* 1. COMPACT PROFESSIONAL HEADER */}
      <header className="physio-header">
        <div className="physio-header-identity">
          <div className="physio-avatar-mark">
            <Icon name="kira" size={20} color="#ffffff" />
          </div>
          <div className="physio-header-text">
            <div className="physio-title-row">
              <h1>Kira — AI Physio Assistant</h1>
            </div>
            <p>Clinical rehabilitation guidance &amp; movement science</p>
          </div>
        </div>

        <div className="physio-header-actions">
          {messages.length > 0 && (
            <button
              type="button"
              className="physio-clear-btn"
              onClick={handleClear}
              title="Reset conversation"
            >
              Clear chat
            </button>
          )}
          <div className={`physio-status-chip ${configured ? 'online' : ''}`}>
            <span className={`physio-dot ${configured ? 'green' : 'gray'}`} />
            <span>{configured ? 'Connected · Kisner & Colby Base' : 'Offline / Demo'}</span>
          </div>
        </div>
      </header>

      {/* 2. COLLAPSIBLE CLINICAL CONTEXT PANEL */}
      <section className="physio-context-panel" aria-label="Attached patient care context">
        <button
          type="button"
          className="physio-context-bar"
          onClick={() => setContextExpanded(!contextExpanded)}
          aria-expanded={contextExpanded}
        >
          <div className="physio-context-summary">
            <span>🩺</span>
            <strong>Clinical Context:</strong>
            <span>{plan?.name || 'Self-Guided Mobility Starter'}</span>
            <span className="physio-context-badge">
              {activeAssignment?.by ? `Dr. ${activeAssignment.by}` : 'Self-Guided'}
            </span>
            <span>· {sessionList.length} session{sessionList.length === 1 ? '' : 's'}</span>
          </div>
          <span className="physio-context-toggle-icon">
            {contextExpanded ? 'Hide Details ▲' : 'View Details ▼'}
          </span>
        </button>

        {contextExpanded && (
          <div className="physio-context-drawer">
            <div className="physio-context-grid">
              <div className="physio-context-item">
                <span className="physio-context-k">ASSIGNED CARE PLAN</span>
                <span className="physio-context-v">
                  {plan?.name || 'Self-Guided Mobility Starter'} (v{plan?.v || 1})
                </span>
              </div>
              <div className="physio-context-item">
                <span className="physio-context-k">PRESCRIBED EXERCISES</span>
                <span className="physio-context-v">
                  {plan?.items?.length ? plan.items.map(i => i.ex).join(', ') : 'None active'}
                </span>
              </div>
              <div className="physio-context-item">
                <span className="physio-context-k">COMPLETED SESSIONS</span>
                <span className="physio-context-v">
                  {sessionList.length} recorded session{sessionList.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="physio-context-item">
                <span className="physio-context-k">SUPERVISING CLINICIAN</span>
                <span className="physio-context-v">
                  {activeAssignment?.by ? `Dr. ${activeAssignment.by}` : 'Unassigned (Self-Guided)'}
                </span>
              </div>
            </div>
            {feedbackList?.length > 0 && (
              <div className="physio-clinician-note-banner">
                <Icon name="bell" size={14} color="var(--pri)" />
                <span>
                  <strong>Latest Clinician Note:</strong> &ldquo;{feedbackList[feedbackList.length - 1].message}&rdquo;
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. MAIN CONVERSATION ROOM */}
      <main className="physio-chat-box">
        {!hasConsent ? (
          <div className="physio-consent-screen">
            <div className="physio-consent-card">
              <div className="physio-consent-icon">
                <Icon name="shield" size={32} color="var(--pri)" />
              </div>
              <h2>AI Physio Assistant Safety &amp; Privacy Notice</h2>
              <p>
                Kira is an educational AI rehabilitation companion grounded in established therapeutic exercise principles (Kisner &amp; Colby).
              </p>
              <ul className="physio-consent-bullets">
                <li>
                  <strong>Not a substitute for emergency care:</strong> If you experience acute chest pain, joint locking, or sudden neurological weakness, contact a medical emergency professional immediately.
                </li>
                <li>
                  <strong>Clinical context scope:</strong> Your assigned exercises, repetition counts, and biomechanical scores are referenced only to tailor guidance in this conversation.
                </li>
                <li>
                  <strong>Zero raw video:</strong> No video or audio is ever transmitted. Queries are processed with zero-retention parameters.
                </li>
              </ul>
              <button
                type="button"
                className="btn physio-consent-btn"
                onClick={giveConsent}
              >
                I Understand &amp; Agree — Start Assistant
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable Message History */}
            <div className="physio-messages-area">
              {messages.length === 0 && (
                <div className="physio-empty-welcome">
                  <div className="physio-empty-avatar">
                    <Icon name="kira" size={26} color="#ffffff" />
                  </div>
                  <h3>How can Kira help your recovery today?</h3>
                  <p>
                    I am connected to your exercise plan and therapeutic exercise textbooks. Ask me about movement form, soreness rules, warm-up exercises, or how your excursion scores are calculated.
                  </p>

                  <div className="physio-suggestions-list">
                    {CONVERSATION_STARTERS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className="physio-starter-card"
                        onClick={() => handleSend(c.prompt)}
                      >
                        <div className="starter-icon-wrap">
                          <Icon name={c.icon} size={16} color="var(--pri)" />
                        </div>
                        <div className="starter-text">
                          <div className="starter-title">{c.label}</div>
                          <div className="starter-desc">{c.desc}</div>
                        </div>
                        <span className="starter-arrow" aria-hidden="true">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Message History */}
              {messages.map((m, idx) => (
                <div key={idx} className={`physio-msg-row ${m.role}`}>
                  <div className="physio-msg-avatar" aria-hidden="true">
                    {m.role === 'assistant' ? (
                      <Icon name="kira" size={16} color="#ffffff" />
                    ) : (
                      user?.displayName?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="physio-msg-body">
                    {m.role === 'assistant' && (
                      <div className="physio-msg-author">
                        <span className="physio-author-name">Kira</span>
                        <span className="physio-author-badge">Clinical AI</span>
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
                  <div className="physio-msg-avatar" aria-hidden="true">
                    <Icon name="kira" size={16} color="#ffffff" />
                  </div>
                  <div className="physio-msg-body">
                    <div className="physio-msg-author">
                      <span className="physio-author-name">Kira</span>
                      <span className="physio-author-badge">Analyzing biomechanics...</span>
                    </div>
                    <div className="physio-bubble typing">
                      <div className="physio-typing-indicator" aria-label="Kira is typing">
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

            {/* 4. ANCHORED MESSAGE COMPOSER */}
            <div className="physio-composer-area">
              <div className="physio-input-wrap">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Kira about your movement form, soreness rules, or recovery..."
                  rows={2}
                  maxLength={1500}
                  disabled={loading}
                  aria-label="Message to Kira"
                />
                <button
                  type="button"
                  className="physio-send-btn"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  title="Send message (Enter)"
                >
                  <Icon name="send" size={18} color="#ffffff" />
                </button>
              </div>
              <div className="physio-disclaimer-subtext">
                Educational guidance only. Prescribed rehabilitation targets are managed by your clinician.
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
