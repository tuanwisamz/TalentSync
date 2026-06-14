import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import toast from 'react-hot-toast';

export default function JobBoard() {
  const { supabase, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        let query = supabase
          .from('jobs')
          .select('*, company:company_id(name, logo_url, industry, location)')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (search) {
          query = query.ilike('title', `%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [search, supabase]);

  const handleApply = async (jobId) => {
    try {
      setApplying(jobId);
      
      // Check if already applied
      const { data: existingApp } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('talent_id', user.id)
        .single();
        
      if (existingApp) {
        toast.error('You have already applied to this job');
        setApplying(null);
        return;
      }

      // Check if talent profile is complete (has resume)
      const { data: profile } = await supabase
        .from('talent_profiles')
        .select('resume_url')
        .eq('id', user.id)
        .single();

      if (!profile?.resume_url) {
        toast.error('Please upload a resume in your profile before applying');
        setApplying(null);
        return;
      }

      // Apply
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          talent_id: user.id,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Successfully applied!');
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to apply to job');
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white animate-fade-in-up">Job Board</h1>
          <p className="text-white/60 mt-1">Discover and apply to new opportunities.</p>
        </div>
      </div>

      <div className="card">
        <div className="search-wrap">
          <span className="search-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search jobs by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-12 w-12 bg-white/10 rounded-lg mb-4"></div>
              <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-white/10 rounded w-full mt-auto"></div>
            </div>
          ))
        ) : jobs.length === 0 ? (
          <div className="col-span-full card text-center py-12 text-white/50">
            No open jobs found matching your criteria.
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="card card-interactive flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {job.company?.logo_url ? (
                    <img src={job.company.logo_url} alt={job.company.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white/40">
                      {job.company?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white leading-tight">{job.title}</h3>
                    <p className="text-sm text-white/50">{job.company?.name}</p>
                  </div>
                </div>
                {job.work_mode === 'remote' && (
                  <span className="badge badge-success">Remote</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {job.location && <span className="badge badge-neutral">📍 {job.location}</span>}
                {job.salary_range && <span className="badge badge-neutral">💰 {job.salary_range}</span>}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {job.requirements?.slice(0, 3).map((req, i) => (
                  <span key={i} className="text-xs font-medium text-white/70 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    {req}
                  </span>
                ))}
                {job.requirements?.length > 3 && (
                  <span className="text-xs font-medium text-white/40 px-2 py-1">
                    +{job.requirements.length - 3} more
                  </span>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-white/10">
                <button 
                  onClick={() => handleApply(job.id)}
                  disabled={applying === job.id}
                  className="btn btn-primary w-full"
                >
                  {applying === job.id ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
