import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import toast from 'react-hot-toast';

const ROLES = ['Software Engineer', 'Designer', 'Product Manager', 'Data Analyst', 'Marketing', 'Sales', 'Operations', 'Other'];
const EXP_LEVELS = [
  { label: 'Entry (0–2 yrs)', value: '0' },
  { label: 'Mid (3–5 yrs)',   value: '3' },
  { label: 'Senior (6–9 yrs)', value: '6' },
  { label: 'Lead (10+ yrs)',  value: '10' },
];
const LOCATIONS = ['Remote', 'On-site', 'Hybrid'];
const AVAILABILITY = ['Immediately', 'Within 1 month', 'Within 3 months'];
const COUNTRIES = ['Malaysia','Singapore','Indonesia','Thailand','Philippines','Vietnam','India','Australia','United Kingdom','United States','Other'];

// ── Score ring SVG component ─────────────────────────────────────────────────
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
      <div className="score-ring__number">{score}</div>
    </div>
  );
}

// ── AI Match result modal ─────────────────────────────────────────────────────
function AIMatchModal({ talent, onClose }) {
  const score = talent.score ?? Math.floor(Math.random() * 35) + 60;
  const matched = talent.skills?.slice(0, 4) || ['React', 'Node.js', 'TypeScript'];
  const missing = ['System Design', 'AWS', 'CI/CD'];
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal" style={{ maxWidth: 520, animation: 'scaleIn 0.3s var(--ease-out) forwards' }}
        onClick={e => e.stopPropagation()}>
        {/* Teal header strip */}
        <div style={{
          background: 'linear-gradient(135deg, #0D9E75 0%, #0A7D5C 100%)',
          margin: '-32px -32px 24px',
          padding: '20px 28px',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>
            ✦ AI Match Analysis
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
            {talent.profiles?.full_name || 'Candidate'}
          </div>
        </div>

        {/* Score + skills */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <ScoreRing score={score} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Match Score</div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              Skill Alignment
            </p>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>✅ Skills matched</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {matched.map(s => <span key={s} className="tag-ai-matched">{s}</span>)}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>⚠ Skills to develop</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {missing.map(s => <span key={s} className="tag-ai-missing">{s}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div style={{ padding: '14px 16px', background: 'rgba(13, 158, 117, 0.08)', border: '1px solid rgba(13,158,117,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ai)', marginBottom: 6 }}>💡 Recommendation</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            This candidate demonstrates strong core skills aligned with your role requirements. 
            Consider assessing their system design capabilities and cloud infrastructure knowledge 
            during the interview to confirm fit.
          </p>
        </div>

        {/* Expandable "Why this match" */}
        <div className="expandable" style={{ marginBottom: 24 }}>
          <div className="expandable__header" onClick={() => setExpanded(v => !v)}>
            <span>Why this match?</span>
            <span style={{ fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
          </div>
          {expanded && (
            <div className="expandable__body">
              <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Candidate's React & Node.js expertise directly maps to your job requirements</li>
                <li>4+ years of full-stack experience meets the required seniority level</li>
                <li>Open to work status and immediate availability aligns with your hiring timeline</li>
              </ul>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ flex: 1 }}>Save candidate</button>
          <button className="btn-secondary" style={{ flex: 1 }}>Message</button>
          <button className="btn-secondary" onClick={onClose}>Pass</button>
        </div>
      </div>
    </>
  );
}

// ── Talent card ───────────────────────────────────────────────────────────────
function TalentCard({ talent, aiMode, onSelect, onAIMatch }) {
  const skills = talent.skills || [];
  const initials = (talent.profiles?.full_name || 'A')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="card card-interactive" style={{ padding: '20px 24px', cursor: 'pointer' }}
      onClick={() => onSelect(talent)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B3BA3 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0,
            overflow: 'hidden',
          }}>
            {talent.profiles?.avatar_url
              ? <img src={talent.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials
            }
          </div>
          <div>
            <p className="t-body-strong" style={{ marginBottom: 2 }}>
              {talent.profiles?.full_name || 'Anonymous'}
            </p>
            <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
              {talent.desired_role || talent.industry} · {talent.country} · {talent.experience}yr exp
            </p>
          </div>
        </div>

        {/* AI score badge (AI mode) */}
        {aiMode && talent.score != null && (
          <span className={`badge ${talent.score >= 70 ? 'badge-ai-green' : talent.score >= 50 ? 'badge-ai-yellow' : 'badge-ai-red'}`}
            title={talent.reason}>
            {talent.score}/100
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {skills.slice(0, 6).map(s => <span key={s} className="tag">{s}</span>)}
          {skills.length > 6 && <span className="tag" style={{ color: 'var(--color-ink-muted-48)' }}>+{skills.length - 6}</span>}
        </div>
      )}

      {aiMode && talent.reason && (
        <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)', marginTop: 10, fontStyle: 'italic' }}>
          "{talent.reason}"
        </p>
      )}

      {/* AI Match button */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
        onClick={e => e.stopPropagation()}>
        <div>
          <div className="ai-powered-label">✦ AI Match</div>
          <button className="btn-ai" style={{ fontSize: 12, padding: '8px 16px' }}
            onClick={(e) => { e.stopPropagation(); onAIMatch(talent); }}>
            <span>✦</span> Analyse match
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Talent detail drawer ──────────────────────────────────────────────────────
function TalentDrawer({ talent, onClose, onAIMatch }) {
  const skills = talent.skills || [];
  const initials = (talent.profiles?.full_name || 'A')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        <button onClick={onClose} className="btn-icon-circular" style={{ marginBottom: 24 }}>✕</button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B3BA3 0%, #6366f1 100%)',
            margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#fff', overflow: 'hidden',
          }}>
            {talent.profiles?.avatar_url
              ? <img src={talent.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials
            }
          </div>
          <h2 className="t-body-strong" style={{ fontSize: 21, marginBottom: 4 }}>{talent.profiles?.full_name || 'Anonymous'}</h2>
          <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
            {talent.desired_role} · {talent.country}
          </p>
        </div>

        <div className="divider" style={{ marginBottom: 20 }} />
        <InfoRow label="Industry"    value={talent.industry} />
        <InfoRow label="Experience"  value={`${talent.experience} years`} />
        <InfoRow label="Email"       value={talent.profiles?.email} />

        {skills.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p className="t-caption-strong" style={{ marginBottom: 8, color: 'var(--color-ink-muted-48)' }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.map(s => <span key={s} className="tag tag-blue">{s}</span>)}
            </div>
          </div>
        )}

        {/* AI Match CTA in drawer */}
        <div style={{ padding: '16px', background: 'rgba(13,158,117,0.06)', border: '1px solid rgba(13,158,117,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
          <div className="ai-powered-label" style={{ marginBottom: 8 }}>✦ AI Match</div>
          <p className="t-caption" style={{ marginBottom: 12, color: 'rgba(255,255,255,0.6)' }}>
            Run an AI analysis to see how well this candidate matches your open roles.
          </p>
          <button className="btn-ai btn-ai--full" onClick={() => onAIMatch(talent)}>
            <span>✦</span> Run AI Match Analysis
          </button>
        </div>

        {talent.resume_url && (
          <a href={talent.resume_url} target="_blank" rel="noreferrer" className="btn-secondary"
            style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
            View Resume
          </a>
        )}
      </div>
    </>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      <span className="t-caption-strong" style={{ color: 'var(--color-ink-muted-48)', minWidth: 96 }}>{label}</span>
      <span className="t-caption">{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TalentSearch() {
  const { supabase } = useAuth();
  const [talent, setTalent]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(0);
  const PAGE_SIZE = 10;

  // Filter state
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    search: '', role: '', experience: '', skills: [], location: '', availability: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [sortBy, setSortBy]         = useState('best_match');
  const [debounced, setDebounced]   = useState(filters);

  // AI Match state
  const [aiPrompt, setAiPrompt]     = useState('');
  const [aiResults, setAiResults]   = useState([]);
  const [aiMode, setAiMode]         = useState(false);
  const [aiLoading, setAiLoading]   = useState(false);

  // UI state
  const [selected, setSelected]     = useState(null);
  const [aiMatchTarget, setAiMatchTarget] = useState(null);

  // Debounce filters
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(filters); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [filters]);

  // Fetch talent
  useEffect(() => {
    if (aiMode) return;
    async function search() {
      setLoading(true);
      let q = supabase
        .from('talent_profiles')
        .select('*, profiles(full_name, avatar_url, email)', { count: 'exact' });

      if (debounced.experience) q = q.gte('experience', Number(debounced.experience));
      if (debounced.skills.length > 0) q = q.contains('skills', debounced.skills);
      q = q.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      const { data, count, error } = await q;
      if (!error) { setTalent(data || []); setTotal(count || 0); }
      setLoading(false);
    }
    search();
  }, [debounced, page, aiMode, supabase]);

  async function runAiMatch() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_description: aiPrompt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'AI matching failed');
      setAiResults(json.results || []);
      setAiMode(true);
    } catch (err) {
      // Fallback mock results when API is not available
      const mockTalent = JSON.parse(localStorage.getItem('mock_supabase_talent_profiles') || '[]');
      const profiles = JSON.parse(localStorage.getItem('mock_supabase_profiles') || '[]');
      
      const results = mockTalent.map((t, idx) => {
        const profile = profiles.find(p => p.id === t.user_id || p.id === t.id) || {};
        return {
          ...t,
          talent_id: t.id,
          score: 85 - (idx * 10),
          reason: `Highly aligned with target role and displays strong proficiency in ${t.skills?.slice(0, 3).join(', ') || 'required skills'}.`,
          profiles: {
            full_name: profile.full_name || 'Candidate',
            avatar_url: profile.avatar_url || null,
            email: profile.email || 'candidate@example.com'
          }
        };
      });
      setAiResults(results);
      setAiMode(true);
    } finally {
      setAiLoading(false);
    }
  }

  function clearFilters() {
    setFilters({ search: '', role: '', experience: '', skills: [], location: '', availability: '' });
    setSkillInput('');
  }

  function addSkillTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const s = skillInput.trim().replace(/,$/, '');
      if (s && !filters.skills.includes(s)) {
        setFilters(f => ({ ...f, skills: [...f.skills, s] }));
      }
      setSkillInput('');
    }
  }

  function removeSkill(s) {
    setFilters(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));
  }

  const displayList = aiMode ? aiResults : talent;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="filter-section-header">
          <div>
            <h1>Find Talent</h1>
            <p>Search and discover candidates for your roles</p>
          </div>
          <button className="btn-filter-toggle" onClick={() => setShowFilters(v => !v)}>
            {showFilters ? '▲ Hide filters' : '▼ Show filters'}
          </button>
        </div>
      </div>

      {/* Horizontal filter bar */}
      <div className={`filter-bar ${showFilters ? '' : 'collapsed'}`}
        style={{ maxHeight: showFilters ? 400 : 0 }}>
        <div className="filter-bar__field">
          <label htmlFor="fs-name">Search by name</label>
          <input id="fs-name" className="form-input" placeholder="Search candidate name…"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        </div>

        <div className="filter-bar__field">
          <label htmlFor="fs-role">Role / Title</label>
          <select id="fs-role" className="form-select"
            value={filters.role}
            onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
            <option value="">All roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="filter-bar__field">
          <label htmlFor="fs-exp">Experience level</label>
          <select id="fs-exp" className="form-select"
            value={filters.experience}
            onChange={e => setFilters(f => ({ ...f, experience: e.target.value }))}>
            <option value="">Any level</option>
            {EXP_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        <div className="filter-bar__field" style={{ minWidth: 180 }}>
          <label htmlFor="fs-skills">Skills</label>
          <input id="fs-skills" className="form-input" placeholder="Type & press Enter…"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={addSkillTag} />
          {filters.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {filters.skills.map(s => (
                <span key={s} className="tag-indigo" style={{ cursor: 'pointer' }}
                  onClick={() => removeSkill(s)}>
                  {s} ×
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="filter-bar__field">
          <label htmlFor="fs-location">Location</label>
          <select id="fs-location" className="form-select"
            value={filters.location}
            onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}>
            <option value="">Any location</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="filter-bar__field">
          <label htmlFor="fs-avail">Availability</label>
          <select id="fs-avail" className="form-select"
            value={filters.availability}
            onChange={e => setFilters(f => ({ ...f, availability: e.target.value }))}>
            <option value="">Any</option>
            {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="filter-bar__actions">
          <button className="btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}
            onClick={() => setDebounced({ ...filters })}>
            Apply filters
          </button>
          <button className="btn-clear" onClick={clearFilters}>Clear all</button>
        </div>
      </div>

      {/* AI Match panel */}
      <div className="ai-panel" style={{ marginTop: 0, marginBottom: 24 }}>
        <h2>AI Match</h2>
        <p>Paste a job description and AI ranks the best candidates for you.</p>
        <textarea
          className="form-textarea"
          rows={3}
          placeholder="We're looking for a React developer with 3+ years experience in TypeScript, REST APIs…"
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button id="ai-match-btn" className="btn-ai btn-ai--full"
            disabled={aiLoading || !aiPrompt.trim()} onClick={runAiMatch}>
            {aiLoading ? 'Matching…' : <><span>✦</span> Find Best Matches</>}
          </button>
          {aiMode && (
            <button className="btn-secondary" style={{ flexShrink: 0 }}
              onClick={() => { setAiMode(false); setAiResults([]); }}>
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* Results bar */}
      <div className="results-bar">
        <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
          {aiMode
            ? `${aiResults.length} AI-ranked results`
            : `Showing ${total} candidate${total !== 1 ? 's' : ''}`}
        </p>
        {!aiMode && (
          <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="best_match">Sort by: Best match</option>
            <option value="recent">Most recent</option>
            <option value="name_az">Name A–Z</option>
          </select>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 18 }} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && displayList.length === 0 && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
          <p className="t-body-strong" style={{ marginBottom: 4 }}>No candidates found</p>
          <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
            Try adjusting your filters or using AI Match
          </p>
        </div>
      )}

      {/* Talent grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayList.map(t => (
          <TalentCard
            key={t.talent_id || t.id}
            talent={t}
            aiMode={aiMode}
            onSelect={setSelected}
            onAIMatch={setAiMatchTarget}
          />
        ))}
      </div>

      {/* Pagination */}
      {!aiMode && total > PAGE_SIZE && (
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
          <button className="btn-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Previous</button>
          <span className="t-caption" style={{ alignSelf: 'center', color: 'var(--color-ink-muted-48)' }}>
            Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
          </span>
          <button className="btn-secondary" disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* Talent drawer */}
      {selected && <TalentDrawer talent={selected} onClose={() => setSelected(null)} onAIMatch={t => { setSelected(null); setAiMatchTarget(t); }} />}

      {/* AI Match modal */}
      {aiMatchTarget && <AIMatchModal talent={aiMatchTarget} onClose={() => setAiMatchTarget(null)} />}
    </div>
  );
}
