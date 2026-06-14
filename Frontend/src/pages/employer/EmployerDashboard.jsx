import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function EmployerDashboard() {
  const { supabase, user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, pending: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      // Jobs count
      const { count: jobCount } = await supabase
        .from('job_postings')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', user.id);

      // Applications count
      const { data: jobs } = await supabase
        .from('job_postings')
        .select('id')
        .eq('company_id', user.id);

      const jobIds = (jobs || []).map((j) => j.id);
      let appCount = 0, pendingCount = 0;

      if (jobIds.length > 0) {
        const { count: total } = await supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .in('job_id', jobIds);
        const { count: pending } = await supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .in('job_id', jobIds)
          .eq('status', 'pending');
        appCount = total || 0;
        pendingCount = pending || 0;
      }

      // Recent jobs
      const { data: rJobs } = await supabase
        .from('job_postings')
        .select('id, title, work_mode, location, created_at')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      // Recent applications
      const { data: rApps } = jobIds.length > 0
        ? await supabase
            .from('applications')
            .select('id, status, applied_at, talent_profiles(profiles(full_name)), job_postings(title)')
            .in('job_id', jobIds)
            .order('applied_at', { ascending: false })
            .limit(5)
        : { data: [] };

      setStats({ jobs: jobCount || 0, applications: appCount, pending: pendingCount });
      setRecentJobs(rJobs || []);
      setRecentApps(rApps || []);
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your hiring activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid-3 stagger-children" style={{ marginBottom: 48 }}>
        <StatCard value={stats.jobs} label="Active Jobs" />
        <StatCard value={stats.applications} label="Total Applications" />
        <StatCard value={stats.pending} label="Pending Review" accent />
      </div>

      {/* CTA row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
        <Link to="/employer/post-job" className="btn-primary" id="cta-post-job">+ Post a Job</Link>
        <Link to="/employer/talent-search" className="btn-secondary" id="cta-find-talent">Find Talent</Link>
      </div>

      {/* Recent activity */}
      <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent jobs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="t-body-strong">Recent Jobs</h2>
            <Link to="/employer/post-job" className="link" style={{ fontSize: 14 }}>+ Add</Link>
          </div>
          {recentJobs.length === 0
            ? <EmptyState message="No jobs posted yet." cta="Post your first job" to="/employer/post-job" />
            : recentJobs.map((j) => (
              <div key={j.id} className="card card-interactive" style={{ marginBottom: 12, padding: '16px 20px' }}>
                <p className="t-body-strong" style={{ marginBottom: 4 }}>{j.title}</p>
                <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
                  {j.location} · {j.work_mode} · {new Date(j.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          }
        </div>

        {/* Recent applications */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="t-body-strong">Recent Applications</h2>
            <Link to="/employer/applications" className="link" style={{ fontSize: 14 }}>View all</Link>
          </div>
          {recentApps.length === 0
            ? <EmptyState message="No applications yet." />
            : recentApps.map((a) => (
              <div key={a.id} className="card card-interactive" style={{ marginBottom: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p className="t-body-strong" style={{ marginBottom: 2 }}>
                    {a.talent_profiles?.profiles?.full_name || 'Applicant'}
                  </p>
                  <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
                    {a.job_postings?.title}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-number" style={accent ? { background: 'linear-gradient(135deg, #FF9F0A 0%, var(--color-violet) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : undefined}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: 'badge-pending',
    reviewed: 'badge-reviewed',
    interview_scheduled: 'badge-interview',
    accepted: 'badge-accepted',
    rejected: 'badge-rejected',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status?.replace('_', ' ')}</span>;
}

function EmptyState({ message, cta, to }) {
  return (
    <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
      <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)', marginBottom: cta ? 12 : 0 }}>{message}</p>
      {cta && <Link to={to} className="link" style={{ fontSize: 14 }}>{cta}</Link>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="page-header">
        <div className="skeleton" style={{ width: 160, height: 34, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 240, height: 17 }} />
      </div>
      <div className="grid-3" style={{ marginBottom: 48 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 18 }} />)}
      </div>
    </div>
  );
}
