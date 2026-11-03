import { useEffect, useState, useCallback, useRef } from 'react';
import usePoseCamera from '../vision/usePoseCamera.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import InteractivePoseFigure from './InteractivePoseFigure.jsx';
import ExerciseDemoPlayer from '../components/ExerciseDemoPlayer.jsx';
import { MOVENET_KEYPOINTS } from './poseConstants.js';
import LivingRoomArmRaiseIllustration from './illustrations/LivingRoomArmRaiseIllustration.jsx';
import PhysioReviewIllustration from './illustrations/PhysioReviewIllustration.jsx';
import MiniSquatSideIllustration from './illustrations/MiniSquatSideIllustration.jsx';
import { HandDrawnIcon } from './illustrations/HandDrawnIcons.jsx';
import HeroScribbleArrow from './illustrations/HeroScribbleArrow.jsx';
import './landing.css';

// Keypoint clinical purpose reference
const KEYPOINT_DESCRIPTIONS = {
  nose: 'Nose landmark: used for head alignment, eye level and posture orientation.',
  left_eye: 'Left eye: provides head tilt and lateral gaze tracking.',
  right_eye: 'Right eye: provides head tilt and lateral gaze tracking.',
  left_ear: 'Left ear: used with eye level to detect head rotation and cervical posture.',
  right_ear: 'Right ear: used with eye level to detect head rotation and cervical posture.',
  left_shoulder: 'Left shoulder: primary pivot for bilateral arm raise excursion.',
  right_shoulder: 'Right shoulder: primary pivot for bilateral arm raise excursion.',
  left_elbow: 'Left elbow: tracks upper-arm orientation and arm raise symmetry.',
  right_elbow: 'Right elbow: tracks upper-arm orientation and arm raise symmetry.',
  left_wrist: 'Left wrist: confirms full arm extension during elevation cycles.',
  right_wrist: 'Right wrist: confirms full arm extension during elevation cycles.',
  left_hip: 'Left hip: primary vertex for squat hinge and torso inclination angles.',
  right_hip: 'Right hip: primary vertex for squat hinge and torso inclination angles.',
  left_knee: 'Left knee: core vertex for knee flexion/extension excursion in squats.',
  right_knee: 'Right knee: core vertex for knee flexion/extension excursion in squats.',
  left_ankle: 'Left ankle: lower base of support for knee flexion measurement.',
  right_ankle: 'Right ankle: lower base of support for knee flexion measurement.',
};

// Flagship 02: AI Generated Exercise Presets (grounded in Kisner & Colby)
const AI_EXERCISE_PRESETS = [
  {
    id: 'hip-abduction',
    name: 'Standing Hip Abduction',
    brief: 'Standing hip abduction, coronal plane, 10 reps, 2.0s peak isometric hold, side-on camera view.',
    source: 'Kisner & Colby, Therapeutic Exercise (6th ed.), Ch. 20: The Hip, pp. 742–748',
    joint: 'Hip Abduction',
    plane: 'Coronal / Frontal (Side-on view)',
    targetExcursion: '30°–35°',
    reps: 10,
    steps: [
      'Stance Initiation: Stand tall with fingertips lightly resting on a stable surface for balance. Engage the stance leg gluteus medius without lateral pelvic drop.',
      'Concentric Excursion: Smoothly elevate the working leg outward to 30°–35° in the coronal plane, ensuring toes face directly forward.',
      'Isometric Peak Dwell: Hold the peak elevation for 2.0 seconds. Confirm pelvis remains level and lumbar spine does not laterally flex.',
      'Controlled Eccentric Return: Lower the leg over 2.5 seconds back to the starting vertical stance under steady muscular control.',
    ],
    precautions: 'Monitor for Trendelenburg lateral trunk lean or compensatory pelvic hiking. If lower back tightness occurs, reduce excursion angle.',
  },
  {
    id: 'wall-slides',
    name: 'Scapular Wall Slides',
    brief: 'Wall slides with scapular upward rotation, 8 reps, 1.5s top hold, front-facing camera view.',
    source: 'Kisner & Colby, Therapeutic Exercise (6th ed.), Ch. 17: The Shoulder & Scapula, pp. 580–586',
    joint: 'Scapulothoracic Upward Rotation',
    plane: 'Coronal (Front-facing camera view)',
    targetExcursion: '90° → 140° elevation',
    reps: 8,
    steps: [
      'Wall Contact & Posture: Stand with head, upper back, and sacrum lightly against wall. Forearms and wrists resting on wall at 90° shoulder abduction.',
      'Upward Slide Phase: Exhale and slide forearms upward along the wall surface to approximately 140° elevation.',
      'Serratus Activation Dwell: At peak height, focus on serratus anterior engagement and upward scapular rotation with a 1.5s dwell.',
      'Controlled Return: Slowly draw elbows back down to 90° starting position, keeping wrists and forearms pinned flush to the wall.',
    ],
    precautions: 'Do not allow the upper trapezius to shrug toward ears. Discontinue if anterior shoulder impingement or lumbar hyperextension occurs.',
  },
  {
    id: 'thoracic-rotation',
    name: 'Seated Thoracic Rotation',
    brief: 'Seated thoracic spine rotational mobility, 8 reps each side, 2.0s hold, neutral pelvis.',
    source: 'Kisner & Colby, Therapeutic Exercise (6th ed.), Ch. 16: The Spine, pp. 490–495',
    joint: 'Thoracic Vertebral Rotation',
    plane: 'Transverse (Front-facing camera view)',
    targetExcursion: '45° rotational excursion',
    reps: 8,
    steps: [
      'Axial Posture Setup: Sit upright in a firm chair with feet planted hip-width apart. Cross arms over chest or hold a light dowel across clavicles.',
      'Rotational Excursion: Exhale and smoothly rotate the upper ribcage through the thoracic spine to 40°–45° while keeping pelvis anchored.',
      'End-Range Pause: Hold rotation steadily for 2.0 seconds while taking a shallow breath, feeling the mid-back stretch without straining.',
      'Centering & Reverse: Inhale and slowly rotate back to center before performing the mirrored repetition on the opposite side.',
    ],
    precautions: 'Ensure motion originates from the thoracic spine, not by torquing lumbar vertebrae or shifting pelvis and knees.',
  },
];

// Flagship 02: Dual-Profile AI Chat Protocols (Clinician Copilot & Patient Physio)
const AI_CHAT_PROFILES = {
  clinician: {
    title: 'Clinician AI Copilot',
    subtitle: 'Caseload compliance triage, deficit detection, regression suggestions, and feedback drafting',
    badge: '👨‍⚕️ Clinician Intelligence',
    prompts: [
      {
        id: 'compliance',
        label: '📊 Roster Compliance',
        user: 'Summarise recent session compliance and volume across my patient roster.',
        assistant: {
          title: 'Patient Roster Adherence & Volume Summary (Last 7 Days)',
          content: [
            '• Overall Clinic Adherence: 79.2% (19 of 24 prescribed sessions completed on-device).',
            '• High Adherence Cohort: Sarah Chen (4/4 sessions, 100% adherence, average form score 94/100) and Marcus Vance (3/3 sessions, 100% adherence).',
            '• Attention Flag: David Miller completed 1 of 3 scheduled Mini-Squat sessions. Telemetry indicates a 14-second camera occlusion gap during Tuesday’s session.',
            '• Review Queue: 2 completed session reports are awaiting your clinical feedback and sign-off in the records portal.',
          ],
          action: 'Open patient roster triage →',
        },
      },
      {
        id: 'deficits',
        label: '🔍 Biomechanical Deficits',
        user: 'Identify any patients showing irregular form scores or movement deficits.',
        assistant: {
          title: 'Biomechanical Deficit & Form Anomaly Detection',
          content: [
            '• Elena Rostova (Prescribed: Mini-Squat Flexion, Target: 45°):',
            '  - Excursion Deficit: Average knee flexion reached 36° (9° ROM deficit vs. target).',
            '  - Tempo Flag: Eccentric phase was 44% faster than prescribed (uncontrolled descent).',
            '  - Clinical Recommendation: Assign seated box squat regression or add an eccentric 2-second dwell cue to cultivate eccentric quad control.',
          ],
          action: 'Assign regression in exercise studio →',
        },
      },
      {
        id: 'feedback',
        label: '📝 Draft Feedback',
        user: 'Draft thoughtful, encouraging clinical feedback for recently submitted sessions.',
        assistant: {
          title: 'Drafted Clinical Feedback (Ready for Clinician Sign-Off)',
          content: [
            '“Hi Sarah! Fantastic job completing all 4 assigned bilateral arm raise sessions this week. Your shoulder elevation showed steady bilateral symmetry with an average excursion of 76°. For next week, let’s focus on holding that 1.5-second pause at the peak before lowering under control. Keep up the great consistency!”',
          ],
          action: 'Approve & send feedback to patient →',
        },
      },
      {
        id: 'regression',
        label: '⚡ Suggest Regression',
        user: 'Suggest exercise regressions for patients struggling with squat depth and anterior knee discomfort.',
        assistant: {
          title: 'Evidence-Based Squat Regressions (Kisner & Colby Ch. 21)',
          content: [
            '1. Sit-to-Stand from Elevated Bench: Restricts knee flexion to 60° while maintaining vertical shin angle and posterior hip hinge.',
            '2. Wall-Supported Isometric Squat Hold: Reduces shear patellofemoral forces; prescribe 3 sets of 15s at 35° knee flexion.',
            '3. Supine Terminal Knee Extensions (TKE): Primes vastus medialis obliquus (VMO) without axial spinal or joint loading.',
          ],
          action: 'Add to custom clinic protocol library →',
        },
      },
    ],
  },
  patient: {
    title: 'Patient AI Physio Companion',
    subtitle: 'Biomechanical form cues, DOMS vs. strain checks, tissue healing phases, and warm-ups',
    badge: '🏃 Patient Companion',
    prompts: [
      {
        id: 'form-cues',
        label: '🎯 Biomechanical Form Cues',
        user: 'What are the exact biomechanical alignment cues and common substitutions to avoid during my squats?',
        assistant: {
          title: 'Biomechanical Form Guide (Kisner & Colby Principles)',
          content: [
            '1. Stance & Feet: Set feet shoulder-width apart, angled out ~10°–15° to allow natural hip seating.',
            '2. Hip Hinge First: Begin the movement by sending your hips back before bending your knees.',
            '3. Knee Tracking: Keep knees tracking in line with your 2nd and 3rd toes. Never let your knees collapse inward (valgus collapse).',
            '4. Chest & Gaze: Keep chest tall and eyes focused forward to maintain a neutral lumbar curve.',
            '💡 Pro Tip: Your camera tracks your knee angle from the side-on view. Aim for your 45° mini-squat green target zone!',
          ],
          action: 'Start guided practice session →',
        },
      },
      {
        id: 'pain-check',
        label: '🩺 DOMS vs. Joint Pain',
        user: 'I feel some soreness after my session. Help me differentiate normal muscle soreness from joint strain.',
        assistant: {
          title: 'Soreness Evaluation (Kisner & Colby Clinical Rules)',
          content: [
            '• Normal Muscle Soreness (DOMS): A dull, generalized ache in the meat of the muscle (quads, glutes) that peaks 24–48 hours post-workout. Eases up with gentle walking and a light warm-up.',
            '• Joint Strain or Inflammation (Alert): A sharp, pinching, or localized pain inside the joint capsule, accompanied by warmth, swelling, or pain that sharpens when you load the leg.',
            '⚠️ Medical Safety Guardrail: If your pain is sharp, deep in the knee joint, or exceeds 4/10 on the pain scale, pause your exercises and notify your clinician directly in the portal.',
          ],
          action: 'Log symptom in session feedback →',
        },
      },
      {
        id: 'phases',
        label: '🛡️ Tissue Healing & Phases',
        user: 'Explain how tissue healing phases affect my rehabilitation exercise intensity.',
        assistant: {
          title: 'Tissue Healing & Exercise Progression',
          content: [
            '• Phase 1: Acute Protection (Days 1–7): Focus on gentle pain-free passive motion and isometric holds to prevent stiffness without stressing repairing fibers.',
            '• Phase 2: Subacute Controlled Motion (Weeks 2–6): Controlled active range-of-motion (like your 45° mini-squats) to align new collagen along lines of stress.',
            '• Phase 3: Chronic Remodeling (Week 7+): Progressive loading, tempo variation, and functional balance challenges.',
          ],
          action: 'View personalized rehabilitation plan →',
        },
      },
      {
        id: 'warmup',
        label: '🔥 Tailored Warm-Up',
        user: 'Provide a tailored dynamic warm-up and mobility routine for my assigned rehabilitation exercises.',
        assistant: {
          title: '5-Minute Rehabilitation Warm-Up',
          content: [
            '1. Cat-Camel Spinal Mobilization: 8 slow cycles to hydrate intervertebral discs.',
            '2. Glute Bridge Activations: 10 reps with a 2-second squeeze at the top to prime hip stabilizers.',
            '3. Ankle Dorsiflexion Rocks: 10 reps per side against a wall to prepare optimal squat depth.',
            '4. Gentle Arm Elevation Swings: 10 smooth bilateral raises to circulate synovial fluid in shoulders.',
            '✨ You are ready to start your camera-guided session!',
          ],
          action: 'Launch camera checklist →',
        },
      },
    ],
  },
};

export default function LandingPage() {
  // Navigation & Modal states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState(-1);

  // Hero Pose Demonstration states
  const [heroExercise, setHeroExercise] = useState('arm'); // 'arm' | 'squat'
  const [heroPlaying, setHeroPlaying] = useState(true);
  const [heroAmount, setHeroAmount] = useState(35);
  const [heroRep, setHeroRep] = useState(2);
  const [heroPhase, setHeroPhase] = useState('Concentric elevation');
  const [heroLayer, setHeroLayer] = useState('both');
  const heroDirRef = useRef(1);

  // Model demo states
  const [selectedExercise, setSelectedExercise] = useState('arm'); // 'arm' | 'squat' | 'toe-touch' | 'heel-raise'
  const [movementAmount, setMovementAmount] = useState(45); // degrees
  const [layerMode, setLayerMode] = useState('both'); // 'sketch' | 'skeleton' | 'both'
  const [pointMode, setPointMode] = useState('17'); // '17' | 'derived' | '33'
  const [selectedLandmark, setSelectedLandmark] = useState(5); // Left shoulder default
  const [isPlayingMotion, setIsPlayingMotion] = useState(false);
  const [simulateTrackingLoss, setSimulateTrackingLoss] = useState(false);
  const motionDirRef = useRef(1);

  // Studio Interactive Demo Player state
  const [studioExercise, setStudioExercise] = useState('Side Arm Raise');
  const [backendDemoModels, setBackendDemoModels] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);

  // Live Camera Demo state (strictly opt-in)
  const [cameraActive, setCameraActive] = useState(false);
  const [livePose, setLivePose] = useState(null);
  const handlePoseFrame = useCallback((pose) => {
    setLivePose(pose);
  }, []);
  const { videoRef, canvasRef, status: camStatus, error: camError, start: startCam, stop: stopCam } = usePoseCamera(handlePoseFrame);

  // Exercise authoring demo states
  const [customExerciseDescription, setCustomExerciseDescription] = useState('Standing hip abduction, side view, 10 reps, 2 second hold');
  const [demoApproved, setDemoApproved] = useState(false);

  // Flagship 02: AI Integration states
  const [selectedAiPresetId, setSelectedAiPresetId] = useState('hip-abduction');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [activeAiChatProfile, setActiveAiChatProfile] = useState('clinician'); // 'clinician' | 'patient'
  const [selectedAiPromptId, setSelectedAiPromptId] = useState('compliance');
  const [customChatMessage, setCustomChatMessage] = useState('');
  const [activeCustomChatExchange, setActiveCustomChatExchange] = useState(null);

  // Query backend demo models catalog on mount
  useEffect(() => {
    fetch('/api/exercises/demo-models')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.demoModels) {
          setBackendDemoModels(data.demoModels);
          setBackendConnected(true);
        }
      })
      .catch(() => {
        // Safe offline fallback
      });
  }, []);

  // Page title and meta setup
  useEffect(() => {
    document.title = 'Kineticare — From Prescribed Movement to Meaningful Feedback';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = 'On-device camera-guided physiotherapy that connects prescribed movement with structured clinician feedback.';
    }
  }, []);

  // Motion animation loop for Hero Interactive Showcase (smooth, clamped 0-78 deg)
  useEffect(() => {
    if (!heroPlaying) return undefined;
    const interval = setInterval(() => {
      setHeroAmount(prev => {
        let dir = heroDirRef.current;
        let next = prev + dir * 2.2;
        if (next >= 78) {
          heroDirRef.current = -1;
          next = 78;
          setHeroPhase('Peak excursion hold');
        } else if (next <= 6) {
          heroDirRef.current = 1;
          next = 6;
          setHeroRep(r => (r >= 5 ? 1 : r + 1));
          setHeroPhase('Concentric elevation');
        } else if (dir > 0) {
          setHeroPhase(heroExercise === 'arm' ? 'Concentric elevation' : 'Eccentric descent');
        } else {
          setHeroPhase(heroExercise === 'arm' ? 'Controlled return' : 'Concentric ascent');
        }
        return Math.round(next);
      });
    }, 45);

    return () => clearInterval(interval);
  }, [heroPlaying, heroExercise]);

  // Motion animation loop for Model Pipeline Figure (stable, clamped strictly 5-85 deg)
  useEffect(() => {
    if (!isPlayingMotion) return undefined;
    const interval = setInterval(() => {
      setMovementAmount(prev => {
        let dir = motionDirRef.current;
        let next = prev + dir * 2.5;
        if (next >= 85) {
          motionDirRef.current = -1;
          next = 85;
        } else if (next <= 5) {
          motionDirRef.current = 1;
          next = 5;
        }
        return Math.round(next);
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isPlayingMotion]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCam();
    };
  }, [stopCam]);

  // Escape key handler for dialogs & mobile menu
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setWalkthroughOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleCamera = () => {
    if (cameraActive) {
      stopCam();
      setCameraActive(false);
      setLivePose(null);
    } else {
      setCameraActive(true);
      setTimeout(() => {
        startCam('fast'); // MoveNet fast mode with local BlazePose fallback
      }, 50);
    }
  };

  return (
    <main className="landing-root">
      {/* 1. EDITORIAL NAVIGATION BAR */}
      <header className="landing-nav-bar">
        <div className="landing-container landing-nav-inner">
          <a href="#hero" className="landing-brand" aria-label="Kineticare home">
            <img src="/logo-blue.png" alt="Kineticare logo" />
            <span>Kineticare</span>
          </a>

          <nav className="landing-nav-links" aria-label="Primary navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#model-pipeline">The vision model</a>
            <a href="#pipeline-steps">The 6-stage pipeline</a>
            <a href="#ai-integration">AI integration</a>
            <a href="#for-clinicians">For clinicians</a>
            <a href="#privacy">Privacy</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="landing-nav-actions">
            <ThemeToggle />
            <a href="/login" className="landing-btn landing-btn-secondary">
              Sign in
            </a>
            <a href="#model-pipeline" className="landing-btn landing-btn-teal">
              Try the demo
            </a>
            <button
              className="landing-mobile-toggle"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="landing-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            <div className="landing-mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />
            <div className="landing-mobile-panel">
              <div className="landing-mobile-header">
                <div className="landing-brand">
                  <img src="/logo-blue.png" alt="Kineticare" />
                  <span>Kineticare</span>
                </div>
                <button
                  type="button"
                  className="landing-mobile-close"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>

              <nav className="landing-mobile-links">
                <a href="#how-it-works" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <span>How it works</span> <span>→</span>
                </a>
                <a href="#model-pipeline" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <span>The vision model</span> <span>→</span>
                </a>
                <a href="#pipeline-steps" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <span>The 6-stage pipeline</span> <span>→</span>
                </a>
                <a href="#ai-integration" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <span>AI integration</span> <span>→</span>
                </a>
                <a href="#for-clinicians" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <span>For clinicians</span> <span>→</span>
                </a>
                <a href="#privacy" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <span>Privacy & telemetry</span> <span>→</span>
                </a>
                <a href="#faq" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <span>FAQ</span> <span>→</span>
                </a>
              </nav>

              <div className="landing-mobile-actions">
                <a href="/login" className="landing-btn landing-btn-primary" onClick={() => setMobileMenuOpen(false)}>
                  Sign in to workspace
                </a>
                <a href="#model-pipeline" className="landing-btn landing-btn-teal" onClick={() => setMobileMenuOpen(false)}>
                  Try interactive demo
                </a>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--land-ink-secondary)' }}>Appearance</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION (Notion-inspired bold editorial composition) */}
      <section id="hero" className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-grid">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">
                <HandDrawnIcon name="heartbeat" size={16} />
                CONNECTED PHYSIOTHERAPY & TELEREHABILITATION
              </span>
              <h1 className="landing-hero-title">
                From prescribed movement to <em>meaningful feedback.</em>
              </h1>
              <p className="landing-hero-desc">
                Kineticare turns a clinician’s recorded demonstration into guided home practice. Powered by two core pillars: <strong>on-device computer vision</strong> for private telemetry and <strong>grounded Google Gemini AI</strong> for exercise generation and dual-profile clinical chat.
              </p>

              <div className="landing-hero-actions">
                <a href="#model-pipeline" className="landing-btn landing-btn-primary">
                  Explore vision model →
                </a>
                <a href="#ai-integration" className="landing-btn landing-btn-teal">
                  Explore AI integration →
                </a>
                <a href="/login" className="landing-btn landing-btn-pill-arrow">
                  Sign in to workspace
                </a>
                <HeroScribbleArrow className="landing-scribble-accent" color="#0D9488" />
              </div>
            </div>

            {/* Live Interactive Hero Movement Demonstration */}
            <div className="landing-hero-art-well">
              <div className="landing-hero-showcase" role="region" aria-label="Interactive pose tracking demonstration">
                <div className="hero-showcase-header">
                  <div className="hero-showcase-title">
                    <HandDrawnIcon name="camera" size={16} />
                    <span>{heroExercise === 'arm' ? 'Bilateral Arm Raise' : 'Mini Squat Flexion'}</span>
                  </div>
                  <span className="hero-showcase-badge">
                    ● On-Device MoveNet
                  </span>
                </div>

                <div className="hero-showcase-stage">
                  <InteractivePoseFigure
                    view={heroExercise === 'arm' ? 'front' : 'side'}
                    amount={heroAmount}
                    layerMode={heroLayer}
                    pointMode="17"
                    lostTracking={false}
                  />

                  {/* Real-time telemetry readouts */}
                  <div className="hero-telemetry-overlay">
                    <span className="hero-telemetry-val">{heroAmount}°</span>
                    <span className="hero-telemetry-label">
                      {heroExercise === 'arm' ? 'Shoulder Elevation' : 'Knee Flexion'}
                    </span>
                  </div>

                  <div className="hero-phase-overlay">
                    <div className="hero-phase-pill">
                      <span>{heroPhase}</span>
                    </div>
                    <div className="hero-phase-rep">
                      Repetition {heroRep} of 5 · 94% Conf
                    </div>
                  </div>
                </div>

                {/* Showcase Interactive Controls */}
                <div className="hero-showcase-controls">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="hero-btn-pill"
                      onClick={() => setHeroPlaying(!heroPlaying)}
                      aria-label={heroPlaying ? 'Pause demonstration' : 'Play demonstration'}
                    >
                      {heroPlaying ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <button
                      type="button"
                      className={`hero-btn-pill ${heroExercise === 'arm' ? 'active' : ''}`}
                      onClick={() => { setHeroExercise('arm'); setHeroAmount(10); }}
                    >
                      Arm Raise
                    </button>
                    <button
                      type="button"
                      className={`hero-btn-pill ${heroExercise === 'squat' ? 'active' : ''}`}
                      onClick={() => { setHeroExercise('squat'); setHeroAmount(10); }}
                    >
                      Mini Squat
                    </button>
                  </div>

                  <button
                    type="button"
                    className="hero-btn-pill"
                    onClick={() => setHeroLayer(l => l === 'both' ? 'skeleton' : l === 'skeleton' ? 'sketch' : 'both')}
                    title="Toggle skeleton and illustration layers"
                  >
                    View: {heroLayer}
                  </button>
                </div>

                <div className="hero-showcase-footer">
                  <span>🔒 Zero Video Stored · Telemetry Only</span>
                  <span>MoveNet 17 Landmarks · 30 FPS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Peeking Product Window (Notion-style preview bottom card) */}
          <div className="landing-product-peek" aria-label="Kineticare live telemetry preview">
            <div className="landing-product-peek-bar">
              <div className="landing-peek-dots">
                <span /><span /><span />
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                kineticare.app / patient / live-session
                <span style={{ color: 'var(--land-teal)', fontWeight: 600 }}>· Live Session Active</span>
              </span>
            </div>
            <div className="landing-product-peek-content">
              <div className="landing-peek-preview">
                <div className="landing-peek-status">
                  <span className="landing-eyebrow">
                    <HandDrawnIcon name="target" size={14} /> LIVE CAMERA METRICS
                  </span>
                  <span className="landing-tag-status tag-shipped">MoveNet Lightning Active</span>
                </div>
                <div className="landing-peek-telemetry">
                  <div>
                    <div className="landing-telemetry-num">03 / 08</div>
                    <div className="landing-telemetry-label">Completed Reps</div>
                  </div>
                  <div>
                    <div className="landing-telemetry-num">78°</div>
                    <div className="landing-telemetry-label">Peak Excursion</div>
                  </div>
                  <div>
                    <div className="landing-telemetry-num">0 ms</div>
                    <div className="landing-telemetry-label">Tracking Gap</div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--land-ink-secondary)' }}>
                  A repetition is counted only when a complete configured movement cycle passes entry, peak dwell and return thresholds. Incomplete cycles across tracking gaps are discarded.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', borderLeft: '1px solid var(--land-border)', paddingLeft: '24px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--land-ink-muted)' }}>CLINICIAN DEMONSTRATION</span>
                <strong style={{ fontSize: '15px' }}>Bilateral Side Arm Raise</strong>
                <span style={{ fontSize: '13px', color: 'var(--land-ink-secondary)' }}>Assigned target: 80° ± 5° · 8 reps</span>
                <a href="/login" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--land-teal)', marginTop: '4px' }}>
                  Open clinical dashboard →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BUILT WITH TECH STRIP */}
      <section className="landing-built-strip">
        <div className="landing-container landing-built-inner">
          <span>BUILT WITH</span>
          <div className="landing-built-item">
            <strong>MoveNet</strong> SinglePose Lightning
          </div>
          <div className="landing-built-item">
            <strong>TensorFlow.js</strong> WebGL + WASM
          </div>
          <div className="landing-built-item">
            <strong>React 19</strong> + Vite 8
          </div>
          <div className="landing-built-item">
            <strong>MongoDB Atlas</strong> Structured Telemetry
          </div>
          <div className="landing-built-item">
            <strong>Privy</strong> Passwordless Auth
          </div>
        </div>
      </section>

      {/* 4. AUDIENCE CARDS / THE CARE LOOP (Garner-inspired 4-column cards) */}
      <section id="how-it-works" className="landing-audience-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-eyebrow">
              <HandDrawnIcon name="checklist" size={16} /> A CONNECTED CARE LOOP
            </span>
            <h2>Made for the whole rehabilitation journey.</h2>
            <p>
              Closing the distance between consultation room instructions and daily home practice with structured telemetry.
            </p>
          </div>

          <div className="landing-audience-grid">
            {/* 1. For Patients */}
            <article className="landing-audience-card">
              <div className="landing-audience-icon">
                <HandDrawnIcon name="heartbeat" size={24} />
              </div>
              <h3>For Patients</h3>
              <p>
                Follow real-time landmark feedback with on-device camera tracking, and chat 24/7 with the Patient AI Physio companion for biomechanical cues, DOMS vs. strain checks, and warm-ups.
              </p>
              <a href="/login" className="landing-audience-link">
                Patient portal <span>→</span>
              </a>
            </article>

            {/* 2. For Clinicians */}
            <article id="for-clinicians" className="landing-audience-card">
              <div className="landing-audience-icon">
                <HandDrawnIcon name="camera" size={24} />
              </div>
              <h3>For Clinicians</h3>
              <p>
                Author textbook-grounded exercises with Gemini, and leverage the Clinician AI Copilot to triage caseload compliance, detect ROM deficits, suggest regressions, and draft feedback.
              </p>
              <a href="/login" className="landing-audience-link">
                Clinician portal <span>→</span>
              </a>
            </article>

            {/* 3. For Clinics & Teams */}
            <article className="landing-audience-card">
              <div className="landing-audience-icon">
                <HandDrawnIcon name="shield" size={24} />
              </div>
              <h3>For Clinics</h3>
              <p>
                HIPAA/privacy-first telemetry architecture. Raw camera frames stay entirely in the browser; only computed angles and adherence data reach the cloud.
              </p>
              <a href="#privacy" className="landing-audience-link">
                Privacy architecture <span>→</span>
              </a>
            </article>

            {/* 4. For Developers & Researchers */}
            <article className="landing-audience-card">
              <div className="landing-audience-icon">
                <HandDrawnIcon name="target" size={24} />
              </div>
              <h3>For Developers</h3>
              <p>
                Clean kinematics engine, One Euro filter smoothing, strict finite-state repetition machine, and grounded Gemini exercise education services.
              </p>
              <a href="#pipeline-steps" className="landing-audience-link">
                Inspect pipeline <span>→</span>
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* 5. FLAGSHIP 01: COMPUTER VISION & MOVEMENT PIPELINE */}
      <section id="model-pipeline" className="landing-flagship-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-eyebrow">
              <HandDrawnIcon name="camera" size={16} /> FLAGSHIP 01 · COMPUTER VISION
            </span>
            <h2>Movement, made visible and verifiable.</h2>
            <p>
              MoveNet estimates 17 body landmarks in real time. Kineticare filters jitter, verifies visibility and camera framing, calculates joint angles via vector arccos, and validates repetition cycles.
            </p>
          </div>

          <div className="landing-model-card">
            {/* Interactive Demo Toolbar */}
            <div className="landing-model-toolbar">
              <div className="landing-segmented" role="group" aria-label="Supported Exercise Selection">
                <button
                  type="button"
                  aria-pressed={selectedExercise === 'arm'}
                  onClick={() => {
                    setSelectedExercise('arm');
                    setMovementAmount(45);
                    setSelectedLandmark(5);
                  }}
                >
                  Arm Raise · Front View
                </button>
                <button
                  type="button"
                  aria-pressed={selectedExercise === 'squat'}
                  onClick={() => {
                    setSelectedExercise('squat');
                    setMovementAmount(45);
                    setSelectedLandmark(13);
                  }}
                >
                  Mini-Squat · Side View
                </button>
                <button
                  type="button"
                  aria-pressed={selectedExercise === 'toe-touch'}
                  onClick={() => {
                    setSelectedExercise('toe-touch');
                    setMovementAmount(50);
                    setSelectedLandmark(11);
                  }}
                >
                  Toe Touch · Side View
                </button>
                <button
                  type="button"
                  aria-pressed={selectedExercise === 'heel-raise'}
                  onClick={() => {
                    setSelectedExercise('heel-raise');
                    setMovementAmount(25);
                    setSelectedLandmark(15);
                  }}
                >
                  Heel Raise · Side View
                </button>
              </div>

              <div className="landing-segmented" role="group" aria-label="Visual Layers">
                {['sketch', 'skeleton', 'both'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={layerMode === mode}
                    onClick={() => setLayerMode(mode)}
                  >
                    {mode === 'sketch' ? 'Illustration' : mode === 'skeleton' ? 'Skeleton' : 'Both Layers'}
                  </button>
                ))}
              </div>

              <div className="landing-segmented" role="group" aria-label="Landmark Mapping">
                <button
                  type="button"
                  aria-pressed={pointMode === '17'}
                  onClick={() => setPointMode('17')}
                >
                  MoveNet 17
                </button>
                <button
                  type="button"
                  aria-pressed={pointMode === 'derived'}
                  onClick={() => setPointMode('derived')}
                >
                  + Derived Midpoints
                </button>
                <button
                  type="button"
                  aria-pressed={pointMode === '33'}
                  onClick={() => setPointMode('33')}
                >
                  33 Comparison
                </button>
              </div>
            </div>

            {/* Split View: Articulated Pose Figure + Telemetry Readout */}
            <div className="landing-model-split">
              <div className="landing-figure-stage">
                <InteractivePoseFigure
                  view={selectedExercise}
                  amount={movementAmount}
                  layerMode={layerMode}
                  pointMode={pointMode}
                  lostTracking={simulateTrackingLoss}
                  selectedPoint={selectedLandmark}
                  onSelectPoint={(idx) => setSelectedLandmark(idx)}
                />
                <div className="landing-figure-caption">
                  {simulateTrackingLoss ? (
                    <span style={{ color: '#DC2626', fontWeight: 600 }}>
                      ⚠️ Tracking loss simulated: required landmarks obscured. Incomplete cycle discarded.
                    </span>
                  ) : (
                    <span>
                      Articulated forward-kinematics figure sharing coordinates with MoveNet 17 landmark overlay. Click any circle to inspect.
                    </span>
                  )}
                </div>
              </div>

              {/* Real-time Readout & Controls */}
              <div className="landing-readout">
                <div className="landing-metric-card">
                  <div>
                    <div className="landing-metric-val">
                      {simulateTrackingLoss ? '—' : `${Math.min(85, Math.max(0, Math.round(movementAmount)))}°`}
                    </div>
                    <div className="landing-metric-label">
                      {selectedExercise === 'arm'
                        ? 'Shoulder Elevation Excursion'
                        : selectedExercise === 'squat'
                        ? 'Knee Flexion Angle'
                        : selectedExercise === 'toe-touch'
                        ? 'Hip Flexion / Forward Bend'
                        : 'Ankle Plantarflexion Excursion'}
                    </div>
                  </div>
                  <span className="landing-tag-status tag-shipped">
                    {simulateTrackingLoss ? 'Loss Handled' : 'Confidence 94%'}
                  </span>
                </div>

                <div className="landing-slider-row">
                  <label htmlFor="range-slider">
                    <span>Simulate Joint Excursion</span>
                    <strong>{Math.min(85, Math.max(0, Math.round(movementAmount)))}°</strong>
                  </label>
                  <input
                    id="range-slider"
                    type="range"
                    min="0"
                    max="85"
                    value={Math.min(85, Math.max(0, Math.round(movementAmount)))}
                    disabled={simulateTrackingLoss}
                    onChange={(e) => setMovementAmount(Math.min(85, Math.max(0, Number(e.target.value))))}
                  />
                </div>

                <div className="landing-status-table">
                  <div className="landing-status-row">
                    <span>Selected Landmark</span>
                    <strong>
                      {selectedLandmark !== null ? MOVENET_KEYPOINTS[selectedLandmark].replace('_', ' ') : 'None'} (idx {selectedLandmark})
                    </strong>
                  </div>
                  <div className="landing-status-row">
                    <span>Clinical Purpose</span>
                    <strong style={{ maxWidth: '280px', textAlign: 'right', fontWeight: 400 }}>
                      {selectedLandmark !== null ? KEYPOINT_DESCRIPTIONS[MOVENET_KEYPOINTS[selectedLandmark]] : 'Select a joint'}
                    </strong>
                  </div>
                  <div className="landing-status-row">
                    <span>FSM Rep Phase</span>
                    <strong style={{ color: simulateTrackingLoss ? '#DC2626' : 'var(--land-teal)' }}>
                      {simulateTrackingLoss
                        ? 'TRACKING_GAP (DISCARDED)'
                        : movementAmount > 70
                        ? 'PEAK_DWELL'
                        : movementAmount > 15
                        ? 'OUTBOUND'
                        : 'REST'}
                    </strong>
                  </div>
                  <div className="landing-status-row">
                    <span>Required Visibility</span>
                    <strong>
                      {selectedExercise === 'arm'
                        ? 'Bilateral Shoulders, Elbows, Hips'
                        : selectedExercise === 'squat'
                        ? 'Shoulder, Hip, Knee, Ankle (One Side)'
                        : selectedExercise === 'toe-touch'
                        ? 'Shoulder, Hip, Knee, Foot (One Side)'
                        : 'Knee, Ankle, Foot Base'}
                    </strong>
                  </div>
                </div>

                {/* Interactive Action Triggers */}
                <div className="landing-interactive-actions">
                  <button
                    type="button"
                    className="landing-btn landing-btn-secondary"
                    onClick={() => setIsPlayingMotion(!isPlayingMotion)}
                  >
                    {isPlayingMotion ? '⏸ Pause Motion' : '▶ Play Movement Cycle'}
                  </button>
                  <button
                    type="button"
                    className="landing-btn landing-btn-secondary"
                    onClick={() => {
                      setIsPlayingMotion(false);
                      setMovementAmount(0);
                    }}
                  >
                    ↺ Reset Rest
                  </button>
                  <button
                    type="button"
                    className="landing-btn landing-btn-secondary"
                    style={{
                      borderColor: simulateTrackingLoss ? '#DC2626' : 'var(--land-border)',
                      color: simulateTrackingLoss ? '#DC2626' : 'inherit',
                    }}
                    onClick={() => setSimulateTrackingLoss(!simulateTrackingLoss)}
                  >
                    {simulateTrackingLoss ? '✓ Return to Camera View' : '⚠️ Simulate Stepping Out of Frame'}
                  </button>
                </div>
              </div>
            </div>

            {/* OPTIONAL LIVE CAMERA DEMO (User-initiated opt-in only) */}
            <div className="landing-camera-tray">
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <span className="landing-eyebrow">
                    <HandDrawnIcon name="camera" size={14} /> LIVE IN-BROWSER CAMERA
                  </span>
                  <h3 style={{ margin: '6px 0 4px', fontSize: '18px' }}>
                    Try with your own webcam
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--land-ink-secondary)' }}>
                    Starts only when you click. Runs MoveNet locally in your browser. Video never leaves your device.
                  </p>
                </div>

                <button
                  type="button"
                  className={`landing-btn ${cameraActive ? 'landing-btn-secondary' : 'landing-btn-teal'}`}
                  onClick={toggleCamera}
                >
                  <HandDrawnIcon name="camera" size={16} />
                  {cameraActive ? 'Stop camera' : 'Start camera demo'}
                </button>
              </div>

              <div style={{ marginTop: cameraActive ? '20px' : '0px', display: cameraActive ? 'block' : 'none' }}>
                {camStatus === 'loading-model' && (
                  <div style={{ padding: '16px', background: 'var(--land-bg)', borderRadius: '8px', fontSize: '14px', marginBottom: '12px' }}>
                    ⏳ Initializing MoveNet SinglePose model via WebGL…
                  </div>
                )}
                {camStatus === 'requesting' && (
                  <div style={{ padding: '16px', background: 'var(--land-bg)', borderRadius: '8px', fontSize: '14px', marginBottom: '12px' }}>
                    📷 Requesting camera permissions…
                  </div>
                )}
                {camError && (
                  <div style={{ padding: '16px', background: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '14px', marginBottom: '12px' }}>
                    ⚠️ Camera error: {camError}. Please ensure camera permissions are granted.
                  </div>
                )}

                <div className="landing-camera-box" style={{ width: '100%', height: '320px', position: 'relative' }}>
                  <video ref={videoRef} muted playsInline autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                </div>

                {livePose && (
                  <div style={{ fontSize: '13px', color: 'var(--land-ink-secondary)' }}>
                    Detected <strong>{livePose.keypoints?.filter((k) => k.score > 0.2).length || 0}</strong> active landmarks at <strong>{livePose.fps || 30} FPS</strong>.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. THE 6-STAGE PROCESSING PIPELINE */}
      <section id="pipeline-steps" style={{ padding: '80px 0', borderTop: '1px solid var(--land-border)' }}>
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-eyebrow">
              <HandDrawnIcon name="target" size={16} /> DETERMINISTIC REHABILITATION KINEMATICS
            </span>
            <h2>Each step has a job.</h2>
            <p>
              How Kineticare transforms 2D webcam video into structured, clinician-verifiable biomechanical telemetry.
            </p>
          </div>

          <div className="landing-pipeline-grid">
            <div className="landing-pipeline-col">
              <span className="landing-pipe-num">01 / CAPTURE</span>
              <strong>MoveNet Landmarks</strong>
              <p>
                MoveNet SinglePose Lightning detects 17 landmark coordinates and confidence scores locally on device at 30+ FPS.
              </p>
            </div>

            <div className="landing-pipeline-col">
              <span className="landing-pipe-num">02 / SMOOTHING</span>
              <strong>One Euro Filter</strong>
              <p>
                Speed-adaptive One Euro filter bank suppresses high-frequency jitter during holds while preserving fast onset dynamics.
              </p>
            </div>

            <div className="landing-pipeline-col">
              <span className="landing-pipe-num">03 / VALIDATION</span>
              <strong>Framing & Margins</strong>
              <p>
                Pre-session checks verify required joint visibility, 1.6–3.2m distance estimation, camera margins, and side/front orientation.
              </p>
            </div>

            <div className="landing-pipeline-col">
              <span className="landing-pipe-num">04 / GEOMETRY</span>
              <strong>Vector Arccos Angle</strong>
              <p>
                Joint angles calculated via dot-product arccos of adjacent bone vectors. Clamped EMA limits prevent spike artifacts.
              </p>
            </div>

            <div className="landing-pipeline-col">
              <span className="landing-pipe-num">05 / FSM ENGINE</span>
              <strong>Hysteresis State Machine</strong>
              <p>
                Strict 4-phase state machine (REST → OUTBOUND → RETURNING → COMPLETE) with dwell hysteresis rejects false jitter double-counts.
              </p>
            </div>

            <div className="landing-pipeline-col">
              <span className="landing-pipe-num">06 / TELEMETRY</span>
              <strong>Counted Rep or Gap</strong>
              <p>
                Completed reps record ROM and eccentric tempo. Incomplete cycles across tracking gaps are discarded and flagged in the report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FLAGSHIP 02: AI INTEGRATION — AI-GENERATED EXERCISES & DUAL-PROFILE CLINICAL COPILOT */}
      <section id="ai-integration" className="landing-ai-section">
        {/* Anchor link alias to preserve any existing links pointing to #exercise-studio */}
        <div id="exercise-studio" style={{ position: 'relative', top: '-70px' }} />

        <div className="landing-container">
          {/* Section Header */}
          <div className="landing-section-header">
            <span className="landing-eyebrow">
              <HandDrawnIcon name="chat" size={16} /> FLAGSHIP 02 · AI INTEGRATION & CLINICAL INTELLIGENCE
            </span>
            <h2>AI-Generated Exercises & Dual-Profile Clinical Copilot</h2>
            <p>
              Kineticare pairs on-device biomechanical vision with Google Gemini intelligence. Clinicians author evidence-grounded exercise protocols from textbook literature, while dual-profile AI copilots assist clinicians with caseload triage and guide patients through safe home practice.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
              <span className="landing-ai-pill-badge">
                <HandDrawnIcon name="checklist" size={13} /> Gemini 2.5 Flash Grounding
              </span>
              <span className="landing-ai-pill-badge">
                <HandDrawnIcon name="shield" size={13} /> Kisner & Colby Textbook Citations
              </span>
              <span className="landing-ai-pill-badge">
                <HandDrawnIcon name="target" size={13} /> Human-in-the-Loop Review Gate
              </span>
              <span className="landing-ai-pill-badge">
                <HandDrawnIcon name="chat" size={13} /> Dual-Profile AI (Clinician + Patient)
              </span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              PILLAR 1: AI-GENERATED EXERCISES FOR CLINICIANS
             ───────────────────────────────────────────────────────────── */}
          <div className="landing-ai-card">
            <div className="landing-ai-header-row">
              <div>
                <span className="landing-eyebrow">
                  <HandDrawnIcon name="checklist" size={14} /> PILLAR 01 · CLINICIAN EXERCISE AUTHORING
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: 800 }}>
                  Evidence-Grounded Exercise Generation
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--land-ink-secondary)' }}>
                  From clinician briefs and peer-reviewed therapeutic literature (e.g. Kisner & Colby), Gemini synthesizes structured movement definitions with strict clinical review barriers.
                </p>
              </div>
              <div className="landing-ai-pill-badge">
                <span>Status:</span> <strong>{demoApproved ? '✓ Clinician Approved' : '⚠️ Pending Review'}</strong>
              </div>
            </div>

            <div className="landing-ai-authoring-grid">
              {/* Left Column: Input & Presets */}
              <div className="landing-ai-prompt-panel">
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--land-ink)' }}>
                  Select Clinical Protocol Preset or Enter Brief:
                </label>
                <div className="landing-ai-preset-chips" role="group" aria-label="Exercise Presets">
                  {AI_EXERCISE_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`landing-ai-preset-btn ${selectedAiPresetId === preset.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAiPresetId(preset.id);
                        setCustomExerciseDescription(preset.brief);
                        setDemoApproved(false);
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`landing-ai-preset-btn ${selectedAiPresetId === 'custom' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedAiPresetId('custom');
                      setDemoApproved(false);
                    }}
                  >
                    Custom Brief...
                  </button>
                </div>

                <div>
                  <label htmlFor="ai-brief-input" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Clinician Intention / Brief
                  </label>
                  <textarea
                    id="ai-brief-input"
                    rows={3}
                    value={selectedAiPresetId === 'custom' ? customExerciseDescription : (AI_EXERCISE_PRESETS.find(p => p.id === selectedAiPresetId)?.brief || customExerciseDescription)}
                    onChange={(e) => {
                      setSelectedAiPresetId('custom');
                      setCustomExerciseDescription(e.target.value);
                      setDemoApproved(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--land-border)',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      background: 'var(--land-card)',
                      color: 'var(--land-ink)',
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ background: 'var(--land-card)', border: '1px solid var(--land-border)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--land-ink-secondary)', marginBottom: '2px' }}>
                    Evidence Base:
                  </div>
                  <div style={{ color: 'var(--land-teal)', fontWeight: 600 }}>
                    {AI_EXERCISE_PRESETS.find(p => p.id === selectedAiPresetId)?.source || 'Kisner & Colby, Therapeutic Exercise, 6th ed.'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--land-ink-secondary)' }}>
                  <input type="checkbox" id="ai-consent-mock" defaultChecked disabled style={{ accentColor: 'var(--land-teal)' }} />
                  <label htmlFor="ai-consent-mock">Strictly anonymized: No identifiable patient data sent to Gemini.</label>
                </div>

                <button
                  type="button"
                  className="landing-btn landing-btn-teal"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '13px' }}
                  onClick={() => {
                    setIsAiGenerating(true);
                    setTimeout(() => {
                      setIsAiGenerating(false);
                      setDemoApproved(false);
                    }, 350);
                  }}
                >
                  {isAiGenerating ? 'Synthesizing with Gemini...' : '⚡ Generate Evidence Protocol (Demo)'}
                </button>
              </div>

              {/* Right Column: Structured Generated Protocol */}
              {(() => {
                const currentPreset = AI_EXERCISE_PRESETS.find(p => p.id === selectedAiPresetId) || AI_EXERCISE_PRESETS[0];
                return (
                  <div className="landing-ai-protocol-display">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--land-teal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          STRUCTURED CLINICAL DRAFT
                        </span>
                        <h4 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800 }}>
                          {selectedAiPresetId === 'custom' ? 'Custom Protocol Draft' : currentPreset.name}
                        </h4>
                      </div>
                      <span className={`landing-tag-status ${demoApproved ? 'tag-shipped' : 'tag-review'}`}>
                        {demoApproved ? '✓ Approved for Assignment' : '⚠️ Pending Clinician Review'}
                      </span>
                    </div>

                    <div className="landing-ai-protocol-meta">
                      <div><span style={{ color: 'var(--land-ink-muted)' }}>Target Joint:</span> <strong>{currentPreset.joint}</strong></div>
                      <div><span style={{ color: 'var(--land-ink-muted)' }}>Camera Plane:</span> <strong>{currentPreset.plane}</strong></div>
                      <div><span style={{ color: 'var(--land-ink-muted)' }}>Target Excursion:</span> <strong>{currentPreset.targetExcursion}</strong></div>
                      <div><span style={{ color: 'var(--land-ink-muted)' }}>Prescribed Reps:</span> <strong>{currentPreset.reps} reps / set</strong></div>
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--land-ink-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Movement Execution Phases
                      </div>
                      <div className="landing-ai-protocol-phases">
                        {currentPreset.steps.map((step, idx) => (
                          <div key={idx} className="landing-ai-phase-item">
                            <span className="landing-ai-phase-num">{idx + 1}</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="landing-ai-precaution-box">
                      <HandDrawnIcon name="shield" size={18} color="#92400E" accent="#B45309" />
                      <div>
                        <strong>Source-Grounded Precautions:</strong> {currentPreset.precautions}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--land-border)', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--land-ink-muted)' }}>
                        {demoApproved
                          ? '✓ Draft validated and added to clinic exercise catalog.'
                          : 'Draft is locked: Cannot be assigned to patients without explicit approval.'}
                      </div>
                      <button
                        type="button"
                        className={`landing-btn ${demoApproved ? 'landing-btn-secondary' : 'landing-btn-teal'}`}
                        style={{ padding: '7px 16px', fontSize: '12.5px' }}
                        onClick={() => setDemoApproved(!demoApproved)}
                      >
                        {demoApproved ? 'Revoke Approval' : 'Approve Draft for Assignment'}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Verification with Kinematics Demo Player */}
            <div style={{ marginTop: '32px', paddingTop: '28px', borderTop: '1px solid var(--land-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span className="landing-eyebrow">
                    <HandDrawnIcon name="target" size={13} /> FORWARD-KINEMATICS VERIFICATION
                  </span>
                  <h4 style={{ margin: '2px 0 0', fontSize: '17px', fontWeight: 700 }}>
                    Authentic Movement Demonstration Models
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--land-ink-secondary)' }}>
                    Once defined and reviewed, exercises run against validated biomechanical kinematic models with dwell phase detection.
                  </p>
                </div>

                <div className="landing-segmented" role="group" aria-label="Select Demo Model Protocol">
                  {[
                    { name: 'Side Arm Raise', label: 'Arm Raise (Front)' },
                    { name: 'Squat', label: 'Squat (Side)' },
                    { name: 'Toe Touch', label: 'Toe Touch (Side)' },
                    { name: 'Bilateral standing heel raise', label: 'Heel Raise (Side)' },
                  ].map(demo => (
                    <button
                      key={demo.name}
                      type="button"
                      aria-pressed={studioExercise === demo.name}
                      onClick={() => setStudioExercise(demo.name)}
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>

              <ExerciseDemoPlayer
                exerciseName={studioExercise}
                targetExcursionDeg={studioExercise === 'Side Arm Raise' ? 75 : studioExercise === 'Toe Touch' ? 60 : studioExercise === 'Bilateral standing heel raise' ? 25 : 45}
                targetReps={5}
                showControls={true}
                autoPlay={true}
              />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              PILLAR 2: DUAL-PROFILE AI CHAT (CLINICIAN COPILOT & PATIENT PHYSIO)
             ───────────────────────────────────────────────────────────── */}
          <div className="landing-ai-chat-card">
            <div className="landing-ai-chat-header">
              <div>
                <span className="landing-eyebrow">
                  <HandDrawnIcon name="chat" size={14} /> PILLAR 02 · DUAL-PROFILE AI REHABILITATION CHAT
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: 800 }}>
                  Context-Aware AI Chat for Both Profiles
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--land-ink-secondary)' }}>
                  Switch profiles to experience how Kineticare tailors clinical assistance for clinicians and rehabilitation guidance for patients.
                </p>
              </div>

              {/* Profile Switcher Tabs */}
              <div className="landing-ai-profile-tabs" role="tablist" aria-label="AI Chat Profile Switcher">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeAiChatProfile === 'clinician'}
                  className={`landing-ai-profile-tab ${activeAiChatProfile === 'clinician' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveAiChatProfile('clinician');
                    setSelectedAiPromptId('compliance');
                    setActiveCustomChatExchange(null);
                  }}
                >
                  <span>👨‍⚕️ Clinician AI Copilot</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeAiChatProfile === 'patient'}
                  className={`landing-ai-profile-tab ${activeAiChatProfile === 'patient' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveAiChatProfile('patient');
                    setSelectedAiPromptId('form-cues');
                    setActiveCustomChatExchange(null);
                  }}
                >
                  <span>🏃 Patient AI Physio</span>
                </button>
              </div>
            </div>

            <div className="landing-ai-chat-body">
              {/* Profile Subheader & Quick Prompt Chips */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--land-ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {AI_CHAT_PROFILES[activeAiChatProfile].badge} — Try a sample prompt:
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--land-teal)', fontWeight: 600 }}>
                    Powered by Google Gemini 2.5 Flash
                  </span>
                </div>

                <div className="landing-ai-chip-scroll" role="group" aria-label="Prompt Suggestions">
                  {AI_CHAT_PROFILES[activeAiChatProfile].prompts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`landing-ai-prompt-chip ${selectedAiPromptId === p.id && !activeCustomChatExchange ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAiPromptId(p.id);
                        setActiveCustomChatExchange(null);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Chat Messages Group */}
              {(() => {
                const currentProfile = AI_CHAT_PROFILES[activeAiChatProfile];
                const activePrompt = currentProfile.prompts.find(p => p.id === selectedAiPromptId) || currentProfile.prompts[0];
                const displayUser = activeCustomChatExchange?.user || activePrompt.user;
                const displayAssistant = activeCustomChatExchange?.assistant || activePrompt.assistant;

                return (
                  <div className="landing-ai-msg-group">
                    {/* User Query */}
                    <div className="landing-ai-msg-user">
                      <div style={{ fontSize: '11px', opacity: 0.75, marginBottom: '4px' }}>
                        {activeAiChatProfile === 'clinician' ? 'Dr. Aris Thorne (Clinician)' : 'Sarah Chen (Patient)'}
                      </div>
                      <div>{displayUser}</div>
                    </div>

                    {/* AI Response */}
                    <div className="landing-ai-msg-assistant">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: 'var(--land-teal)' }}>
                          <HandDrawnIcon name="chat" size={14} />
                          <span>{currentProfile.title}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--land-ink-muted)' }}>
                          Grounded in textbook clinical telemetry
                        </span>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: 'var(--land-ink)' }}>
                        {displayAssistant.title}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                        {displayAssistant.content.map((paragraph, pIdx) => (
                          <div key={pIdx} style={{ whiteSpace: 'pre-line' }}>{paragraph}</div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--land-border)', flexWrap: 'wrap', gap: '8px' }}>
                        <a
                          href="/login"
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'var(--land-teal)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {displayAssistant.action}
                        </a>
                        <span style={{ fontSize: '11px', color: 'var(--land-ink-muted)' }}>
                          {activeAiChatProfile === 'clinician'
                            ? 'Review required prior to patient transmission'
                            : 'Educational guidance only · Not a medical diagnosis'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Mock Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customChatMessage.trim()) return;
                  setActiveCustomChatExchange({
                    user: customChatMessage,
                    assistant: {
                      title: activeAiChatProfile === 'clinician'
                        ? 'Clinical Caseload Guidance (Simulated)'
                        : 'Biomechanical Form Guidance (Simulated)',
                      content: [
                        `• Evaluated inquiry: "${customChatMessage}"`,
                        activeAiChatProfile === 'clinician'
                          ? '• Caseload records & clinical guidelines cross-referenced. Consider checking Sarah Chen and David Miller for recent form compliance.'
                          : '• Focus on maintaining steady breathing, keeping knees aligned with toes, and stopping immediately if pain exceeds 3/10.',
                      ],
                      action: 'Continue in full workspace chat →',
                    },
                  });
                  setCustomChatMessage('');
                }}
                style={{ display: 'flex', gap: '8px', marginTop: '4px' }}
              >
                <input
                  type="text"
                  placeholder={
                    activeAiChatProfile === 'clinician'
                      ? 'Ask about caseload adherence, form anomalies, or feedback...'
                      : 'Ask about exercise form, muscle soreness, or warm-ups...'
                  }
                  value={customChatMessage}
                  onChange={(e) => setCustomChatMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '9999px',
                    border: '1.5px solid var(--land-border)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    background: 'var(--land-bg)',
                    color: 'var(--land-ink)',
                  }}
                />
                <button
                  type="submit"
                  className="landing-btn landing-btn-teal"
                  style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '9999px' }}
                >
                  Send
                </button>
              </form>
            </div>

            {/* Governance & Privacy Footer */}
            <div className="landing-ai-chat-footer">
              <span>✓ Explicit Consent Barrier: AI only processes data after informed user opt-in.</span>
              <span>✓ Zero PII: Patient identifiers and video streams are completely excluded.</span>
              <span>✓ Clinician Authority: AI assists and explains; clinicians prescribe.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRIVACY & SECURITY SECTION */}
      <section id="privacy" style={{ padding: '80px 0', borderTop: '1px solid var(--land-border)' }}>
        <div className="landing-container">
          <div className="landing-privacy-card">
            <div className="landing-privacy-icon">
              <HandDrawnIcon name="shield" size={38} color="#0D9488" />
            </div>
            <div>
              <span className="landing-eyebrow">ZERO-VIDEO CLOUD ARCHITECTURE</span>
              <h2 style={{ margin: '8px 0 12px', fontSize: '28px', fontWeight: 800 }}>
                Video stays on your device. Only telemetry travels.
              </h2>
              <p style={{ margin: '0 0 16px', color: 'var(--land-ink-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
                Unlike traditional telehealth video calls, Kineticare processes video frames directly on the patient’s CPU/GPU via WebGL.
                No raw camera video is ever streamed, saved, or uploaded to our servers. Only computed joint angles, repetition timestamps, and tracking gap telemetry are sent to MongoDB Atlas.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <span className="landing-tag-status tag-shipped">✓ In-Browser Processing</span>
                <span className="landing-tag-status tag-shipped">✓ Patient-Controlled Sharing</span>
                <span className="landing-tag-status tag-shipped">✓ Encrypted Atlas Telemetry</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" style={{ padding: '80px 0', borderTop: '1px solid var(--land-border)' }}>
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-eyebrow">
              <HandDrawnIcon name="checklist" size={16} /> FAQ
            </span>
            <h2>Clear answers about how Kineticare works.</h2>
          </div>

          <div className="landing-faq-accordion">
            {[
              {
                q: 'Does Kineticare diagnose medical conditions or replace a doctor?',
                a: 'No. Kineticare is a remote exercise companion and telemetry tool. The measurements support clinician review and do not provide medical diagnosis, guarantee movement safety, or replace physical therapy consultations.',
              },
              {
                q: 'Which exercises are currently supported for camera tracking?',
                a: 'The active validated vision pipeline supports Squat / Mini-squat (from a side-on camera view, tracking knee flexion angles) and Bilateral Side Arm Raise (from a front-facing camera view, tracking shoulder elevation angles). Additional exercises are catalog definitions or educational guides.',
              },
              {
                q: 'What happens when tracking is lost or someone steps out of frame?',
                a: 'Kineticare never guesses motion across occlusions. If a patient steps out of frame or required landmarks are lost, the in-progress repetition cycle is discarded, the state machine resets to REST, and the duration is logged as a tracking gap in the clinician report.',
              },
              {
                q: 'How does AI exercise generation and the clinical approval workflow operate?',
                a: 'In the clinical studio, clinicians enter a movement brief and peer-reviewed citations (e.g. Kisner & Colby Therapeutic Exercise). Google Gemini synthesizes a structured protocol covering target joints, setup, execution phases, and source-grounded precautions. Crucially, all AI drafts are stored in a locked "pending-review" state and cannot be assigned to patients until the clinician explicitly validates and approves them.',
              },
              {
                q: 'How does the Dual-Profile AI Chat differ between clinicians and patients?',
                a: 'The Clinician AI Copilot is tuned for clinical caseload triage: summarizing roster adherence, flagging abnormal joint ROM deficits, suggesting exercise regressions, and drafting personalized feedback. The Patient AI Physio Companion assists patients during home practice: answering form questions, evaluating muscle soreness using Kisner & Colby criteria (DOMS vs. joint strain), explaining healing phases, and delivering dynamic warm-up routines with automatic red-flag alerts.',
              },
            ].map((item, index) => (
              <div key={index} className="landing-faq-item">
                <button
                  type="button"
                  className="landing-faq-q"
                  aria-expanded={faqOpenIndex === index}
                  onClick={() => setFaqOpenIndex(faqOpenIndex === index ? -1 : index)}
                >
                  <span>{item.q}</span>
                  <span style={{ fontSize: '20px', fontWeight: 400 }}>
                    {faqOpenIndex === index ? '−' : '+'}
                  </span>
                </button>
                {faqOpenIndex === index && (
                  <div className="landing-faq-a">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION */}
      <section className="landing-final-cta">
        <div className="landing-container">
          <HandDrawnIcon name="heartbeat" size={42} color="#0D9488" />
          <h2>Ready to bridge the rehabilitation gap?</h2>
          <p>
            Start your journey with clear demonstrations and meaningful practice telemetry.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a href="/login" className="landing-btn landing-btn-teal" style={{ padding: '12px 28px', fontSize: '15px' }}>
              Sign in to Kineticare
            </a>
            <button
              type="button"
              className="landing-btn landing-btn-secondary"
              style={{ padding: '12px 28px', fontSize: '15px' }}
              onClick={() => setWalkthroughOpen(true)}
            >
              ▶ Watch 60s walkthrough
            </button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo-blue.png" alt="" width="26" height="26" />
            <strong style={{ color: 'var(--land-ink)' }}>Kineticare</strong>
            <span>— Observations support clinician review.</span>
          </div>

          <div className="landing-footer-links">
            <a href="#how-it-works">How it works</a>
            <a href="#model-pipeline">The model</a>
            <a href="#privacy">Privacy</a>
            <a href="/login">Sign in</a>
          </div>

          <div>
            © {new Date().getFullYear()} Kineticare · On-device rehabilitation companion
          </div>
        </div>
      </footer>

      {/* 12. WALKTHROUGH MODAL */}
      {walkthroughOpen && (
        <div
          className="landing-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setWalkthroughOpen(false);
          }}
        >
          <div className="landing-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="walk-title">
            <button
              type="button"
              className="landing-modal-close"
              aria-label="Close modal"
              onClick={() => setWalkthroughOpen(false)}
            >
              ×
            </button>
            <h2 id="walk-title" style={{ margin: 0, fontSize: '22px' }}>
              Kineticare 60-Second Walkthrough
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--land-ink-secondary)' }}>
              See how a clinician records an approved reference, how a patient calibrates their camera and performs reps, and how the session report captures range and tracking gaps.
            </p>
            <div style={{ height: '220px', background: 'var(--land-bg)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '1px dashed var(--land-border)' }}>
              <LivingRoomArmRaiseIllustration style={{ maxHeight: '140px' }} />
              <span style={{ fontSize: '12px', color: 'var(--land-ink-muted)' }}>
                Walkthrough interactive demo available in the flagship model section above.
              </span>
            </div>
            <button
              type="button"
              className="landing-btn landing-btn-primary"
              style={{ alignSelf: 'flex-end' }}
              onClick={() => setWalkthroughOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
