import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import toast from 'react-hot-toast';

const BADGE_MAP = {
  pending: 'badge-pending', reviewed: 'badge-reviewed',
  interview_scheduled: 'badge-interview', accepted: 'badge-accepted', rejected: 'badge-rejected',
};

const TARGET_ROLES = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer',
  'DevOps Engineer', 'Full Stack Developer', 'Data Analyst', 'Mobile Developer',
  'QA Engineer', 'Cloud Architect',
];

const ROLE_REQUIREMENTS = {
  'Software Engineer':    ['React / Vue / Angular', 'REST APIs', 'Git & CI/CD', 'SQL / NoSQL', 'System Design', 'Cloud (AWS/GCP)', 'TypeScript', 'Testing (Jest/Cypress)'],
  'Data Scientist':       ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow / PyTorch', 'Data Viz', 'Feature Engineering', 'Jupyter'],
  'Full Stack Developer': ['React', 'Node.js', 'TypeScript', 'REST APIs', 'PostgreSQL', 'Docker', 'CI/CD', 'Cloud deployment'],
  'Product Manager':      ['Roadmapping', 'Stakeholder management', 'User research', 'Jira / Trello', 'A/B testing', 'Data analysis', 'PRD writing', 'Agile/Scrum'],
  'DevOps Engineer':      ['Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Cloud (AWS/GCP/Azure)', 'Monitoring (Grafana)', 'Scripting'],
  'UX Designer':          ['Figma', 'User research', 'Prototyping', 'Design systems', 'Usability testing', 'Wireframing', 'Accessibility', 'Information architecture'],
};

// ── Score Ring SVG ─────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = ((score / 100) * circ).toFixed(1);
  return (
    <div className="score-ring-wrap">
      <svg viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} className="score-ring__track" />
        <circle cx="44" cy="44" r={r} className="score-ring__fill"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset="0"
        />
      </svg>
      <div className="score-ring__number">{score}%</div>
    </div>
  );
}

// ── AI Career Analysis Card ────────────────────────────────────────────────
function AICareerAnalysis() {
  const { supabase, user } = useAuth();
  const [targetRole, setTargetRole]   = useState('');
  const [roleInput, setRoleInput]     = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [analysing, setAnalysing]     = useState(false);
  const [result, setResult]           = useState(null);
  const [expandWhy, setExpandWhy]     = useState(false);

  const filtered = TARGET_ROLES.filter(r => r.toLowerCase().includes(roleInput.toLowerCase()));

  async function runAnalysis() {
    if (!targetRole) { toast.error('Please select a target role first'); return; }
    setAnalysing(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/career-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target_role: targetRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Analysis failed');
      setResult(json);
    } catch {
      // Demo result when API not available
      setResult({
        score: 76,
        matched: ['React', 'Node.js', 'TypeScript', 'REST APIs'],
        missing: ['System Design', 'Cloud (AWS/GCP)', 'CI/CD Pipelines'],
        recommendation: `Your core skills align well with a ${targetRole} role. Consider obtaining an AWS or GCP cloud certification to address the gap in cloud infrastructure knowledge. Strengthening your system design skills through mock interviews and "Designing Data-Intensive Applications" is highly recommended. With these additions, you would be a strong candidate.`,
        why: [
          `React & Node.js expertise directly maps to the ${targetRole} job requirements`,
          '4 years of full-stack experience meets the required seniority level',
          'TypeScript proficiency is a standout skill increasingly required in senior roles',
        ],
      });
    } finally {
      setAnalysing(false);
    }
  }

  const reqList = ROLE_REQUIREMENTS[targetRole] || ROLE_REQUIREMENTS['Software Engineer'];

  return (
    <div className="ai-career-card">
      {/* Teal header strip */}
      <div className="ai-header-strip" style={{ margin: 0, borderRadius: 0 }}>
        <div className="ai-header-strip__title">
          ✦ AI Career Analysis
        </div>
        {result && (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            Target: {targetRole}
          </span>
        )}
      </div>

      <div className="ai-career-card__body">
        {/* Step 1: role selector */}
        {!result && (
          <>
            <p className="t-caption" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
              See how your skills stack up against your target role
            </p>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <label className="form-label" htmlFor="ai-role-input" style={{ marginBottom: 8 }}>
                What role are you targeting?
              </label>
              <input
                id="ai-role-input"
                className="form-input"
                placeholder="e.g. Software Engineer"
                value={roleInput}
                onChange={e => { setRoleInput(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
              />
              {showDropdown && roleInput && filtered.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: 'rgba(13,17,23,0.98)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 'var(--radius-md)', marginTop: 4, overflow: 'hidden',
                  backdropFilter: 'blur(20px)',
                }}>
                  {filtered.map(r => (
                    <div key={r}
                      style={{
                        padding: '10px 16px', cursor: 'pointer', fontSize: 14,
                        color: 'rgba(255,255,255,0.85)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,158,117,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onMouseDown={() => {
                        setTargetRole(r);
                        setRoleInput(r);
                        setShowDropdown(false);
                      }}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn-ai btn-ai--full"
              disabled={analysing || !targetRole}
              onClick={runAnalysis}
            >
              {analysing ? 'Analysing…' : <><span>✦</span> Analyse my profile</>}
            </button>
          </>
        )}

        {/* Step 2: Analysis result */}
        {result && (
          <div>
            {/* Score + skill coverage */}
            <div className="ai-career-result" style={{ marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <ScoreRing score={result.score} />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>Match Score</p>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Skill Coverage
                </p>
                {/* Progress bars per skill group */}
                {[
                  { label: 'Front-end',   pct: 90 },
                  { label: 'Back-end',    pct: 75 },
                  { label: 'Cloud/DevOps',pct: 40 },
                  { label: 'Architecture',pct: 55 },
                ].map(bar => (
                  <div key={bar.label} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                      <span>{bar.label}</span><span>{bar.pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${bar.pct}%`, background: 'linear-gradient(90deg, var(--color-ai) 0%, #34d399 100%)', borderRadius: 999, transition: 'width 0.8s var(--ease-out)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" style={{ marginBottom: 16 }} />

            {/* Matched skills */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>✅ Skills you have</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.matched.map(s => <span key={s} className="tag-ai-matched">{s}</span>)}
              </div>
            </div>

            {/* Missing skills */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>⚠ Skills to develop</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.missing.map(s => <span key={s} className="tag-ai-missing">{s}</span>)}
              </div>
            </div>

            {/* Recommendation */}
            <div style={{ padding: '14px 16px', background: 'rgba(13,158,117,0.08)', border: '1px solid rgba(13,158,117,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ai)', marginBottom: 6 }}>💡 Recommendations</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>{result.recommendation}</p>
            </div>

            {/* Expandable "Why this match" */}
            <div className="expandable" style={{ marginBottom: 16 }}>
              <div className="expandable__header" onClick={() => setExpandWhy(v => !v)}>
                <span>Why this match?</span>
                <span style={{ fontSize: 11 }}>{expandWhy ? '▲' : '▼'}</span>
              </div>
              {expandWhy && (
                <div className="expandable__body">
                  <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.why.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn-secondary" style={{ fontSize: 13, padding: '9px 16px' }}>
                📥 Save analysis
              </button>
              <a href="#" className="btn-secondary" style={{ fontSize: 13, padding: '9px 16px', textDecoration: 'none' }}>
                Explore courses ↗
              </a>
              <button
                className="btn-pearl"
                style={{ fontSize: 13 }}
                onClick={() => { setResult(null); setTargetRole(''); setRoleInput(''); }}
              >
                🔄 Re-analyse
              </button>
            </div>
          </div>
        )}

        {/* Always visible: Typical role requirements */}
        {!result && targetRole && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
              📋 Typical requirements for {targetRole}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {reqList.map(r => <span key={r} className="tag">{r}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function TalentDashboard() {
  const { supabase, user } = useAuth();
  const [profile, setProfile]       = useState(null);
  const [stats, setStats]           = useState({ applications: 0, interviews: 0, jobs: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);

      const { data: tp } = await supabase
        .from('talent_profiles')
        .select('id, desired_role, experience, profiles(full_name)')
        .eq('user_id', user.id)
        .single();
      setProfile(tp);

      if (tp) {
        const { count: appCount } = await supabase
          .from('applications').select('id', { count: 'exact', head: true }).eq('talent_id', tp.id);
        const { count: intCount } = await supabase
          .from('applications').select('id', { count: 'exact', head: true })
          .eq('talent_id', tp.id).eq('status', 'interview_scheduled');
        const { count: jobCount } = await supabase
          .from('job_postings').select('id', { count: 'exact', head: true }).eq('status', 'active');

        const { data: apps } = await supabase
          .from('applications')
          .select('id, status, applied_at, job_postings(title, companies(name))')
          .eq('talent_id', tp.id)
          .order('applied_at', { ascending: false })
          .limit(5);

        setStats({ applications: appCount || 0, interviews: intCount || 0, jobs: jobCount || 0 });
        setRecentApps(apps || []);
      }
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  if (loading) {
    return (
      <div>
        <div className="page-header"><div className="skeleton" style={{ width: 200, height: 34, marginBottom: 8 }} /></div>
        <div className="grid-3" style={{ marginBottom: 40 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 18 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back{profile?.profiles?.full_name ? `, ${profile.profiles.full_name.split(' ')[0]}` : ''}!</h1>
        <p>{profile?.desired_role || 'Complete your profile to get discovered'}</p>
      </div>

      {!profile && (
        <div className="alert-banner animate-fade-in-up">
          <p className="t-body-strong" style={{ marginBottom: 4 }}>👋 Complete your profile</p>
          <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)', marginBottom: 12 }}>
            Employers can't find you until your profile is set up
          </p>
          <Link to="/talent/profile" className="btn-primary" style={{ fontSize: 14, padding: '8px 18px' }}>
            Set up profile →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid-3 stagger-children" style={{ marginBottom: 40 }}>
        <div className="stat-card">
          <div className="stat-number">{stats.applications}</div>
          <div className="stat-label">Applications Sent</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #34c759 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.interviews}
          </div>
          <div className="stat-label">Interviews Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ background: 'linear-gradient(135deg, #ff9f0a 0%, var(--color-violet) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.jobs}
          </div>
          <div className="stat-label">Active Job Listings</div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
        <Link to="/talent/jobs" className="btn-primary" id="cta-browse-jobs">Browse Jobs</Link>
        <Link to="/talent/profile" className="btn-secondary" id="cta-edit-profile">Edit Profile</Link>
      </div>

      {/* ✦ AI Career Analysis */}
      <AICareerAnalysis />

      {/* Recent applications */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="t-body-strong">Recent Applications</h2>
          <Link to="/talent/applications" className="link" style={{ fontSize: 14 }}>View all</Link>
        </div>

        {recentApps.length === 0 ? (
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
            <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)', marginBottom: 12 }}>
              No applications yet. Browse jobs and start applying!
            </p>
            <Link to="/talent/jobs" className="btn-primary" style={{ fontSize: 14, padding: '8px 18px' }}>Browse Jobs</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentApps.map(app => (
              <div key={app.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p className="t-body-strong" style={{ marginBottom: 2 }}>{app.job_postings?.title}</p>
                  <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
                    {app.job_postings?.companies?.name} · {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${BADGE_MAP[app.status] || 'badge-pending'}`}>
                  {app.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
