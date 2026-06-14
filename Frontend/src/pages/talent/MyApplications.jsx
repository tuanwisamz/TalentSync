import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_MAP = {
  pending: { label: 'Pending', className: 'badge-pending' },
  reviewed: { label: 'Reviewed', className: 'badge-reviewed' },
  interview_scheduled: { label: 'Interview Scheduled', className: 'badge-interview' },
  rejected: { label: 'Rejected', className: 'badge-rejected' },
  hired: { label: 'Hired', className: 'badge-hired' }
};

export default function MyApplications() {
  const { supabase, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchApplications() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            job:job_id (
              title,
              location,
              work_mode,
              company:company_id (
                name,
                logo_url
              )
            )
          `)
          .eq('talent_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [user, supabase]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">My Applications</h1>
          <p className="text-white/60 mt-1">Track the status of your job applications.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Job & Company</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Interview Info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-white/10 rounded"></div>
                        <div className="h-3 w-24 bg-white/10 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td><div className="h-4 w-24 bg-white/10 rounded"></div></td>
                  <td><div className="h-6 w-20 bg-white/10 rounded-full"></div></td>
                  <td><div className="h-4 w-32 bg-white/10 rounded"></div></td>
                </tr>
              ))
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-12 text-white/50">
                  You haven't applied to any jobs yet.
                </td>
              </tr>
            ) : (
              applications.map(app => (
                <tr key={app.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {app.job.company.logo_url ? (
                        <img src={app.job.company.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white/40 border border-white/10">
                          {app.job.company.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white">{app.job.title}</div>
                        <div className="text-sm text-white/50">{app.job.company.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-white/70">
                    {format(new Date(app.created_at), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_MAP[app.status]?.className || 'badge-neutral'}`}>
                      {STATUS_MAP[app.status]?.label || app.status}
                    </span>
                  </td>
                  <td>
                    {app.status === 'interview_scheduled' && app.interview_time ? (
                      <div className="text-sm">
                        <div className="font-medium text-white">
                          {format(new Date(app.interview_time), 'MMM d, h:mm a')} ({app.interview_duration}m)
                        </div>
                        {app.interview_link && (
                          <a href={app.interview_link} target="_blank" rel="noopener noreferrer" className="text-glow-cyan hover:underline">
                            Join Meeting
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/30">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
