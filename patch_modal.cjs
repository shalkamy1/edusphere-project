const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The old GoalModal block to replace
const oldModal = `/* ── ADD/DROP GOAL SELECTION MODAL ─────────────────────────── */
function GoalModal({ onSelect, onClose }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="goal-modal" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="goal-modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="goal-modal-header">
          <div className="goal-modal-icon">🎓</div>
          <h2 className="goal-modal-title">What's your goal?</h2>
          <p className="goal-modal-sub">Choose a scenario and we'll recommend the best courses for you</p>
        </div>

        {/* Options */}
        <div className="goal-modal-options">
          {/* Option 1: Improve GPA */}
          <div
            className={\`goal-option\${hovered === 'gpa' ? ' goal-option-hovered' : ''}\`}
            onMouseEnter={() => setHovered('gpa')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('gpa')}
          >
            <div className="goal-option-icon goal-icon-gpa">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="goal-option-body">
              <div className="goal-option-title">Improve My GPA</div>
              <div className="goal-option-desc">We'll suggest easier, high-impact courses that can boost your GPA this semester</div>
              <div className="goal-option-tags">
                <span className="goal-tag goal-tag-blue">High GPA Impact</span>
                <span className="goal-tag goal-tag-green">Easier Workload</span>
              </div>
            </div>
            <div className="goal-option-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          {/* Divider */}
          <div className="goal-modal-divider"><span>or</span></div>

          {/* Option 2: Complete Requirements */}
          <div
            className={\`goal-option\${hovered === 'req' ? ' goal-option-hovered' : ''}\`}
            onMouseEnter={() => setHovered('req')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('req')}
          >
            <div className="goal-option-icon goal-icon-req">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="goal-option-body">
              <div className="goal-option-title">Complete My Requirements</div>
              <div className="goal-option-desc">We'll recommend courses with the most credit hours to help you graduate faster</div>
              <div className="goal-option-tags">
                <span className="goal-tag goal-tag-orange">More Credits</span>
                <span className="goal-tag goal-tag-purple">Faster Graduation</span>
              </div>
            </div>
            <div className="goal-option-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>

        <p className="goal-modal-note">💡 You can always browse all courses after selecting a goal</p>
      </div>
    </div>
  );
}`;

const newModal = `/* ── AI RECOMMENDATION MODAL ─────────────────────────────── */
function GoalModal({ onSelect, onClose }) {
  const [step, setStep] = useState('choose'); // 'choose' | 'loading' | 'result' | 'error'
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [hovered, setHovered] = useState(null);

  const GOAL_META = {
    gpa: {
      label: 'Improve My GPA',
      icon: '📈',
      color: '#2979ff',
      bg: 'rgba(41,121,255,0.08)',
      message: 'Please analyze my academic record and recommend the best courses to register for next semester that will help me improve my GPA. Focus on courses I can excel in based on my past performance and that have reasonable prerequisites I already completed.',
      tags: [{ text: 'High GPA Impact', cls: 'goal-tag-blue' }, { text: 'Easier Workload', cls: 'goal-tag-green' }],
    },
    req: {
      label: 'Complete My Requirements',
      icon: '🎯',
      color: '#00c853',
      bg: 'rgba(0,200,83,0.08)',
      message: 'Please analyze my academic record and recommend the best courses to register for next semester that will help me complete my graduation requirements faster. Focus on core required courses and courses with the most credit hours I still need.',
      tags: [{ text: 'More Credits', cls: 'goal-tag-orange' }, { text: 'Faster Graduation', cls: 'goal-tag-purple' }],
    },
  };

  const handleGoalSelect = async (goal) => {
    setSelectedGoal(goal);
    setStep('loading');
    const user = JSON.parse(localStorage.getItem('edusphere_user') || '{}');
    const studentId = user?.student_id;
    if (!studentId) {
      setAiResult('Could not identify student. Please log in again.');
      setStep('error');
      return;
    }
    try {
      const res = await adviseStudent(studentId, GOAL_META[goal].message);
      const text = res?.data?.recommendation || res?.recommendation || '';
      setAiResult(text || 'No recommendations available at this time.');
      setStep('result');
    } catch (err) {
      setAiResult(err?.message || 'Failed to get AI recommendations. Please try again.');
      setStep('error');
    }
  };

  const handleConfirm = () => {
    onSelect(selectedGoal);
  };

  // Format AI markdown-ish text to readable HTML paragraphs
  const formatAiText = (text) => {
    if (!text) return [];
    return text.split('\\n').filter(l => l.trim()).map((line, i) => {
      const isBold = line.startsWith('**') || line.startsWith('##') || line.startsWith('#');
      const clean = line.replace(/^#+\\s*/, '').replace(/\\*\\*/g, '');
      return { key: i, text: clean, bold: isBold };
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="goal-modal" style={{ maxWidth: step === 'result' || step === 'loading' ? 680 : 520 }} onClick={e => e.stopPropagation()}>
        <button className="goal-modal-close" onClick={onClose}>✕</button>

        {/* STEP 1: Choose goal */}
        {step === 'choose' && (
          <>
            <div className="goal-modal-header">
              <div className="goal-modal-icon">✨</div>
              <h2 className="goal-modal-title">AI Course Recommendations</h2>
              <p className="goal-modal-sub">Tell us your goal — our AI advisor will analyze your transcript and recommend the best courses for you</p>
            </div>

            <div className="goal-modal-options">
              {Object.entries(GOAL_META).map(([key, meta], idx) => (
                <div key={key}>
                  {idx > 0 && <div className="goal-modal-divider"><span>or</span></div>}
                  <div
                    className={\`goal-option\${hovered === key ? ' goal-option-hovered' : ''}\`}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleGoalSelect(key)}
                    style={{ borderColor: hovered === key ? meta.color + '60' : undefined, background: hovered === key ? meta.bg : undefined }}
                  >
                    <div className="goal-option-icon" style={{ background: meta.bg, color: meta.color, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, flexShrink: 0 }}>
                      {meta.icon}
                    </div>
                    <div className="goal-option-body">
                      <div className="goal-option-title">{meta.label}</div>
                      <div className="goal-option-tags" style={{ marginTop: 6 }}>
                        {meta.tags.map(t => <span key={t.text} className={\`goal-tag \${t.cls}\`}>{t.text}</span>)}
                      </div>
                    </div>
                    <div className="goal-option-arrow" style={{ color: meta.color }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="goal-modal-note">🤖 Powered by Gemini AI — analyzes your full transcript in real time</p>
          </>
        )}

        {/* STEP 2: Loading */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 20, animation: 'spin 2s linear infinite', display: 'inline-block' }}>🤖</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', marginBottom: 8 }}>Analyzing Your Academic Record...</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 28 }}>
              The AI is reviewing your transcript, GPA, prerequisites, and available courses
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              {['Fetching transcript', 'Checking prerequisites', 'Generating recommendations'].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--t3)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c4dff', animation: \`pulse 1.2s \${i * 0.4}s ease infinite\` }} />
                  {s}
                </div>
              ))}
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #7c4dff, #2979ff)', borderRadius: 4, animation: 'progress-bar 3s ease-in-out infinite' }} />
            </div>
          </div>
        )}

        {/* STEP 3: AI Result */}
        {step === 'result' && selectedGoal && (
          <>
            <div className="goal-modal-header" style={{ paddingBottom: 16 }}>
              <div className="goal-modal-icon" style={{ background: GOAL_META[selectedGoal].bg }}>
                {GOAL_META[selectedGoal].icon}
              </div>
              <h2 className="goal-modal-title" style={{ color: GOAL_META[selectedGoal].color }}>
                AI Recommendations Ready
              </h2>
              <p className="goal-modal-sub">Personalized course recommendations based on your academic record</p>
            </div>

            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '18px 20px',
              maxHeight: 380,
              overflowY: 'auto',
              marginBottom: 18,
              lineHeight: 1.7,
              fontSize: 13.5,
              color: 'var(--t1)',
            }}>
              {formatAiText(aiResult).map(({ key, text, bold }) => (
                <p key={key} style={{
                  margin: '0 0 8px 0',
                  fontWeight: bold ? 700 : 400,
                  fontSize: bold ? 14 : 13.5,
                  color: bold ? 'var(--t1)' : 'var(--t2)',
                  borderLeft: bold ? '3px solid #7c4dff' : 'none',
                  paddingLeft: bold ? 10 : 0,
                }}>
                  {text}
                </p>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setStep('choose')}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--t2)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ← Change Goal
              </button>
              <button
                onClick={() => handleGoalSelect(selectedGoal)}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--t2)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                🔄 Regenerate
              </button>
              <button
                onClick={handleConfirm}
                style={{ padding: '10px 24px', borderRadius: 10, background: GOAL_META[selectedGoal].color, border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ✅ Apply Filter
              </button>
            </div>
          </>
        )}

        {/* STEP 4: Error */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 8 }}>Could Not Get Recommendations</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>{aiResult}</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setStep('choose')} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--t2)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                ← Back
              </button>
              {selectedGoal && (
                <button onClick={() => handleGoalSelect(selectedGoal)} style={{ padding: '10px 22px', borderRadius: 10, background: '#7c4dff', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🔄 Try Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`;

if (content.includes('function GoalModal(')) {
    // Find the exact block using start/end markers
    const startMarker = '/* ── ADD/DROP GOAL SELECTION MODAL ─────────────────────────── */';
    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) {
        console.log('Could not find start marker');
        process.exit(1);
    }
    // Find end: "}\r\n" after the function body
    // We look for the end of the GoalModal function by counting braces
    let braceCount = 0;
    let inFunc = false;
    let endIdx = startIdx;
    for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '{') { braceCount++; inFunc = true; }
        if (content[i] === '}') { braceCount--; }
        if (inFunc && braceCount === 0) {
            endIdx = i + 1;
            break;
        }
    }
    const oldBlock = content.slice(startIdx, endIdx);
    content = content.slice(0, startIdx) + newModal + content.slice(endIdx);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('GoalModal replaced successfully! Old block length:', oldBlock.length, 'New block length:', newModal.length);
} else {
    console.log('GoalModal function not found in file');
}
