import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';

const WORK_MODES = ['Remote', 'Hybrid', 'Onsite'];

export default function PostJob() {
  const { supabase, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [companyId, setCompanyId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { work_mode: 'Remote' },
  });

  useEffect(() => {
    async function load() {
      // Get company id
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      setCompanyId(company?.id || null);

      // If editing existing job
      if (id) {
        const { data: job } = await supabase
          .from('job_postings')
          .select('*')
          .eq('id', id)
          .single();
        if (job) {
          reset({
            ...job,
            requirements: job.requirements ? job.requirements.join('\n') : ''
          });
          setSkills(job.skills || []);
        }
      }
    }
    if (user) load();
  }, [user, id, supabase, reset]);

  function addSkill(e) {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const s = skillInput.trim().replace(/,$/, '');
      if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
      setSkillInput('');
    }
  }

  function removeSkill(s) {
    setSkills((prev) => prev.filter((x) => x !== s));
  }

  async function onSubmit(values) {
    if (!companyId) {
      toast.error('Please complete your company profile first.');
      navigate('/employer/profile');
      return;
    }
    setSaving(true);
    try {
      const reqArray = values.requirements
        ? values.requirements.split('\n').map((r) => r.trim()).filter(Boolean)
        : [];
      const payload = { 
        ...values, 
        skills, 
        company_id: companyId, 
        status: 'active',
        requirements: reqArray
      };
      if (id) {
        const { error } = await supabase.from('job_postings').update(payload).eq('id', id);
        if (error) throw error;
        toast.success('Job updated!');
      } else {
        const { error } = await supabase.from('job_postings').insert(payload);
        if (error) throw error;
        toast.success('Job posted!');
      }
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{id ? 'Edit Job' : 'Post a Job'}</h1>
        <p>Fill in the details to {id ? 'update this' : 'publish a new'} job listing</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 680 }}>
        <div className="card" style={{ marginBottom: 24, padding: '24px 28px' }}>
          <h2 className="t-body-strong" style={{ marginBottom: 20 }}>Job Details</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="job-title">Role Title *</label>
            <input id="job-title" className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Senior Frontend Engineer"
              {...register('title', { required: 'Role title is required' })} />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="job-scope">Job Scope *</label>
            <textarea id="job-scope" className={`form-textarea ${errors.scope ? 'error' : ''}`} rows={4}
              placeholder="Describe the day-to-day responsibilities…"
              {...register('scope', { required: 'Job scope is required' })} />
            {errors.scope && <span className="form-error">{errors.scope.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="job-requirements">Requirements</label>
            <textarea id="job-requirements" className="form-textarea" rows={4}
              placeholder="Experience, qualifications, must-haves…"
              {...register('requirements')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="job-location">Location</label>
              <input id="job-location" className="form-input" placeholder="Kuala Lumpur, Malaysia" {...register('location')} />
            </div>
            <div className="form-group">
              <label className="form-label">Working Mode</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {WORK_MODES.map((m) => (
                  <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                    <input type="radio" value={m} {...register('work_mode')} /> {m}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Skills input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="job-skills">Required Skills</label>
            <input
              id="job-skills"
              className="form-input"
              placeholder="Type a skill and press Enter or comma…"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
            />
            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {skills.map((s) => (
                  <span key={s} className="tag tag-blue" style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)}>
                    {s} ×
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button id="post-job-submit" type="submit" className="btn-primary" disabled={saving} style={{ minWidth: 140 }}>
            {saving ? 'Saving…' : id ? 'Update Job' : 'Post Job'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/employer/dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
