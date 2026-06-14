import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import toast from 'react-hot-toast';
import ScheduleInterviewModal from './ScheduleInterviewModal';

const STATUS_OPTIONS = ['pending', 'reviewed', 'interview_scheduled', 'accepted', 'rejected'];

const BADGE_MAP = {
  pending: 'badge-pending',
  reviewed: 'badge-reviewed',
  interview_scheduled: 'badge-interview',
  accepted: 'badge-accepted',
  rejected: 'badge-rejected',
};

export default function Applications() {
  const { supabase, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleApp, setScheduleApp] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);

      const { data: jobs } = await supabase
        .from('job_postings')
        .select('id')
        .eq('company_id', user.id);

      const jobIds = (jobs || []).map((j) => j.id);
      if (jobIds.length === 0) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id, status, applied_at,
          job_postings(title),
          talent_profiles(
            experience, skills, desired_role,
            profiles(full_name, email, avatar_url)
          )
        `)
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false });

      if (!error) setApplications(data || []);
      setLoading(false);
    }

    load();
  }, [user, supabase]);

  async function updateStatus(appId, status) {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', appId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Status updated to "${status.replace('_', ' ')}"`);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  }

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Applications</h1></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Applications</h1>
        <p>{applications.length} application{applications.length !== 1 ? 's' : ''} across all your jobs</p>
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📋</p>
          <p className="t-body-strong" style={{ marginBottom: 4 }}>No applications yet</p>
          <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
            Applications will appear here when talent applies to your job postings
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Role</th>
                <th>Skills</th>
                <th>Date Applied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const profile = app.talent_profiles?.profiles;
                const tp = app.talent_profiles;
                return (
                  <tr key={app.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'var(--color-canvas-parchment)',
                          border: '1px solid var(--color-hairline)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                        }}>
                          {profile?.avatar_url
                            ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : '👤'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{profile?.full_name || '—'}</p>
                          <p style={{ fontSize: 12, color: 'var(--color-ink-muted-48)' }}>{profile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p style={{ fontSize: 14 }}>{app.job_postings?.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-ink-muted-48)' }}>{tp?.desired_role}</p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(tp?.skills || []).slice(0, 3).map(s => (
                          <span key={s} className="tag" style={{ fontSize: 11, padding: '2px 8px' }}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-ink-muted-48)', whiteSpace: 'nowrap' }}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className={`badge ${BADGE_MAP[app.status]}`}
                        style={{
                          border: 'none', background: 'transparent',
                          cursor: 'pointer', fontWeight: 600, fontSize: 12,
                          padding: '3px 8px',
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {tp?.resume_url && (
                          <a href={tp.resume_url} target="_blank" rel="noreferrer"
                            className="btn-pearl" style={{ fontSize: 12, padding: '5px 10px', textDecoration: 'none' }}>
                            Resume
                          </a>
                        )}
                        <button
                          className="btn-utility"
                          style={{ fontSize: 12, padding: '5px 10px' }}
                          onClick={() => setScheduleApp(app)}
                        >
                          Schedule
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {scheduleApp && (
        <ScheduleInterviewModal
          application={scheduleApp}
          onClose={() => setScheduleApp(null)}
          onSaved={() => { setScheduleApp(null); toast.success('Interview scheduled!'); }}
        />
      )}
    </div>
  );
}
