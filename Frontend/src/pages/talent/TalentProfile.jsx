import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';

const INDUSTRIES = ['Technology','Finance','Healthcare','Oil & Gas','Education','Manufacturing','Consulting','Media','Other'];
const COUNTRIES  = ['Malaysia','Singapore','Indonesia','Thailand','Philippines','Vietnam','India','Australia','United Kingdom','United States','Other'];

const SAMPLE_PROFILE = {
  full_name:    'Ahmad Faizal bin Rashid',
  desired_role: 'Full Stack Developer',
  headline:     'Full Stack Developer | React · Node.js · 4 years experience',
  city:         'Kuala Lumpur, Malaysia',
  industry:     'Technology',
  experience:   4,
  country:      'Malaysia',
  bio:          'Passionate full-stack developer with 4 years of experience building scalable web applications for startups and enterprise clients. Specialising in React ecosystems and Node.js backends. I thrive in agile teams, love clean code, and am always seeking roles where I can make a real impact.',
  experience_list: [
    { company: 'Axiata Digital', title: 'Full Stack Developer', period: '2022 – Present', description: 'Built and maintained microservice-based web platform serving 500k+ users. Led front-end migration from Vue 2 to React 18.' },
    { company: 'Fusionex International', title: 'Junior Developer', period: '2020 – 2022', description: 'Developed internal data dashboards using React and D3.js. Integrated REST APIs with PostgreSQL backends.' },
  ],
  education: [
    { degree: 'B.Sc. Computer Science', institution: 'Universiti Malaya', year: '2020' },
  ],
  certificates: [
    { name: 'AWS Certified Developer – Associate', issuer: 'Amazon Web Services', year: '2023' },
    { name: 'Meta Front-End Developer', issuer: 'Meta / Coursera', year: '2022' },
  ],
  projects: [
    { title: 'TalentMatch AI', description: 'AI-powered recruitment platform using GPT-4 to match candidates to job descriptions.', link: 'github.com/faizal/talentmatch' },
    { title: 'Koperasi Finance App', description: 'Mobile-first PWA for cooperative financial management with offline sync support.', link: '' },
  ],
};

const SAMPLE_SKILLS = ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Docker', 'Git', 'Agile'];

export default function TalentProfile() {
  const { supabase, user } = useAuth();
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [skills, setSkills]         = useState(SAMPLE_SKILLS);
  const [skillInput, setSkillInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [resumeName, setResumeName] = useState('Ahmad_Faizal_CV_2024.pdf');
  const [photoFile, setPhotoFile]   = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const photoRef  = useRef(null);
  const resumeRef = useRef(null);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      ...SAMPLE_PROFILE,
      projects:     SAMPLE_PROFILE.projects,
      certificates: SAMPLE_PROFILE.certificates,
    },
  });

  const { fields: projFields, append: addProj, remove: remProj } = useFieldArray({ control, name: 'projects' });
  const { fields: certFields, append: addCert, remove: remCert } = useFieldArray({ control, name: 'certificates' });
  const { fields: expFields,  append: addExp,  remove: remExp  } = useFieldArray({ control, name: 'experience_list' });
  const { fields: eduFields,  append: addEdu,  remove: remEdu  } = useFieldArray({ control, name: 'education' });

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        reset({
          ...SAMPLE_PROFILE,
          ...data,
          projects:      data.projects?.length      ? data.projects      : SAMPLE_PROFILE.projects,
          certificates:  data.certificates?.length  ? data.certificates  : SAMPLE_PROFILE.certificates,
          experience_list: data.experience_list?.length ? data.experience_list : SAMPLE_PROFILE.experience_list,
          education:     data.education?.length     ? data.education     : SAMPLE_PROFILE.education,
        });
        setSkills(data.skills?.length ? data.skills : SAMPLE_SKILLS);
        if (data.photo_url)   setPhotoPreview(data.photo_url);
        if (data.resume_url)  setResumeName('Resume uploaded');
      }
      setLoading(false);
    }
    load();
  }, [user, supabase, reset]);

  function addSkill(e) {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const s = skillInput.trim().replace(/,$/, '');
      if (s && !skills.includes(s)) setSkills(p => [...p, s]);
      setSkillInput('');
    }
  }

  async function uploadFile(file, bucket, path) {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function onSubmit(values) {
    setSaving(true);
    try {
      let photoUrl  = values.photo_url  || null;
      let resumeUrl = values.resume_url || null;
      if (photoFile)  photoUrl  = await uploadFile(photoFile,  'Avatars', `${user.id}/${photoFile.name}`);
      if (resumeFile) resumeUrl = await uploadFile(resumeFile, 'resumes', `${user.id}/${resumeFile.name}`);

      const payload = {
        ...values, user_id: user.id, skills,
        photo_url: photoUrl, resume_url: resumeUrl,
        experience: Number(values.experience) || 0,
      };
      payload.id = user.id;

      const { error } = await supabase.from('talent_profiles').upsert(payload, { onConflict: 'id' });
      if (error) throw error;

      await supabase.from('profiles').update({ full_name: values.full_name, avatar_url: photoUrl }).eq('id', user.id);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="skeleton" style={{ height: 500, borderRadius: 18 }} />;

  // Derive initials for avatar
  const fullName = '';  // will come from form watch; use sample
  const initials = SAMPLE_PROFILE.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>This is what employers see when they discover you</p>
      </div>

      {/* ── Profile hero preview ── */}
      <div className="profile-hero">
        <div className="profile-hero__cover" />
        <div className="profile-hero__body">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              {/* Avatar */}
              <div className="profile-hero__avatar" style={{ cursor: 'pointer' }}
                onClick={() => photoRef.current?.click()}>
                {photoPreview
                  ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : <span>{initials}</span>
                }
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: '#fff', marginBottom: 3 }}>
                  Ahmad Faizal bin Rashid
                </p>
                <p className="t-caption" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Full Stack Developer | React · Node.js · 4 years experience
                </p>
                <p className="t-caption" style={{ color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                  📍 Kuala Lumpur, Malaysia
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
              <span className="badge-open-to-work">● Open to work</span>
            </div>
          </div>

          {/* Completeness bar */}
          <div className="completeness-bar" style={{ maxWidth: 400 }}>
            <div className="completeness-bar__label">
              <span>Profile completeness</span>
              <span style={{ color: 'var(--color-ai)', fontWeight: 600 }}>80%</span>
            </div>
            <div className="completeness-bar__track">
              <div className="completeness-bar__fill" style={{ width: '80%' }} />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ── Personal info ── */}
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 59, 163, 0.8) 0%, rgba(99, 102, 241, 0.6) 100%)',
            padding: '18px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 15,
            color: '#fff',
            letterSpacing: '-0.01em'
          }}>
            Personal Information
          </div>
          <div style={{ padding: '24px 28px' }}>
            {/* Photo upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: photoPreview ? 'transparent' : 'linear-gradient(135deg, #3B3BA3 0%, #6366f1 100%)',
                border: '1px solid var(--color-hairline)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, color: '#fff',
              }}>
                {photoPreview ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
                  }} />
                <button type="button" className="btn-pearl" onClick={() => photoRef.current?.click()}>Upload Photo</button>
                <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)', marginTop: 4 }}>PNG, JPG up to 5 MB</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="tp-name">Full Name *</label>
                <input id="tp-name" className={`form-input ${errors.full_name ? 'error' : ''}`} placeholder="Ahmad Faizal bin Rashid"
                  {...register('full_name', { required: 'Full name is required' })} />
                {errors.full_name && <span className="form-error">{errors.full_name.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tp-role">Desired Role</label>
                <input id="tp-role" className="form-input" placeholder="Full Stack Developer" {...register('desired_role')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tp-headline">Headline</label>
              <input id="tp-headline" className="form-input" placeholder="Full Stack Developer | React · Node.js · 4 years experience"
                {...register('headline')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="tp-industry">Industry</label>
                <select id="tp-industry" className="form-select" {...register('industry')}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tp-exp">Years of Experience</label>
                <input id="tp-exp" type="number" className="form-input" placeholder="4" min={0} max={50} {...register('experience')} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="tp-country">Country</label>
                <select id="tp-country" className="form-select" {...register('country')}>
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tp-city">City</label>
                <input id="tp-city" className="form-input" placeholder="Kuala Lumpur, Malaysia" {...register('city')} />
              </div>
            </div>

            {/* About / Bio */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="tp-bio">About</label>
              <textarea id="tp-bio" className="form-textarea" rows={4}
                placeholder="Tell employers about yourself, your strengths, and what you're looking for…"
                {...register('bio')} />
            </div>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 59, 163, 0.8) 0%, rgba(99, 102, 241, 0.6) 100%)',
            padding: '18px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 15,
            color: '#fff',
            letterSpacing: '-0.01em'
          }}>
            Skills
          </div>
          <div style={{ padding: '24px 28px' }}>
            <input id="tp-skills" className="form-input"
              placeholder="Type a skill and press Enter…"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
            />
            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {skills.map(s => (
                  <span key={s} className="tag-indigo" style={{ cursor: 'pointer' }}
                    onClick={() => setSkills(p => p.filter(x => x !== s))}>
                    {s} ×
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Experience ── */}
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 59, 163, 0.8) 0%, rgba(99, 102, 241, 0.6) 100%)',
            padding: '14px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fff'
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Work Experience</span>
            <button type="button" className="btn-pearl" style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => addExp({ company: '', title: '', period: '', description: '' })}>+ Add</button>
          </div>
          <div style={{ padding: '24px 28px' }}>
            {expFields.map((field, i) => (
              <div key={field.id} style={{ marginBottom: 16, padding: 16, background: 'var(--color-canvas-parchment)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                  <input className="form-input" placeholder="Company" {...register(`experience_list.${i}.company`)} />
                  <input className="form-input" placeholder="Job Title" {...register(`experience_list.${i}.title`)} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <input className="form-input" placeholder="2022 – Present" style={{ flex: 1 }} {...register(`experience_list.${i}.period`)} />
                  {expFields.length > 1 && (
                    <button type="button" className="btn-icon-circular" style={{ width: 36, height: 36, flexShrink: 0 }} onClick={() => remExp(i)}>✕</button>
                  )}
                </div>
                <textarea className="form-textarea" rows={2} placeholder="Brief description of responsibilities…" {...register(`experience_list.${i}.description`)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Education ── */}
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 59, 163, 0.8) 0%, rgba(99, 102, 241, 0.6) 100%)',
            padding: '14px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fff'
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Education</span>
            <button type="button" className="btn-pearl" style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => addEdu({ degree: '', institution: '', year: '' })}>+ Add</button>
          </div>
          <div style={{ padding: '24px 28px' }}>
            {eduFields.map((field, i) => (
              <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                <input className="form-input" placeholder="Degree / Course" {...register(`education.${i}.degree`)} />
                <input className="form-input" placeholder="Institution" {...register(`education.${i}.institution`)} />
                <input className="form-input" placeholder="Year" {...register(`education.${i}.year`)} />
                {eduFields.length > 1 && (
                  <button type="button" className="btn-icon-circular" style={{ width: 36, height: 36 }} onClick={() => remEdu(i)}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Certifications ── */}
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 59, 163, 0.8) 0%, rgba(99, 102, 241, 0.6) 100%)',
            padding: '14px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fff'
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Certifications</span>
            <button type="button" className="btn-pearl" style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => addCert({ name: '', issuer: '', year: '' })}>+ Add</button>
          </div>
          <div style={{ padding: '24px 28px' }}>
            {certFields.map((field, i) => (
              <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                <input className="form-input" placeholder="Certification Name" {...register(`certificates.${i}.name`)} />
                <input className="form-input" placeholder="Issuer" {...register(`certificates.${i}.issuer`)} />
                <input className="form-input" type="number" placeholder="Year" {...register(`certificates.${i}.year`)} />
                {certFields.length > 1 && (
                  <button type="button" className="btn-icon-circular" style={{ width: 36, height: 36 }} onClick={() => remCert(i)}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Projects ── */}
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 59, 163, 0.8) 0%, rgba(99, 102, 241, 0.6) 100%)',
            padding: '14px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fff'
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Projects</span>
            <button type="button" className="btn-pearl" style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => addProj({ title: '', description: '', link: '' })}>+ Add</button>
          </div>
          <div style={{ padding: '24px 28px' }}>
            {projFields.map((field, i) => (
              <div key={field.id} style={{ marginBottom: 20, padding: 16, background: 'var(--color-canvas-parchment)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <input className="form-input" placeholder="Project Title" style={{ flex: 1 }} {...register(`projects.${i}.title`)} />
                  <input className="form-input" placeholder="Link" style={{ flex: 1 }} {...register(`projects.${i}.link`)} />
                  {projFields.length > 1 && (
                    <button type="button" className="btn-icon-circular" style={{ width: 36, height: 36, flexShrink: 0 }} onClick={() => remProj(i)}>✕</button>
                  )}
                </div>
                <textarea className="form-textarea" rows={2} placeholder="What did you build?" {...register(`projects.${i}.description`)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Resume ── */}
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 59, 163, 0.8) 0%, rgba(99, 102, 241, 0.6) 100%)',
            padding: '18px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 15,
            color: '#fff',
            letterSpacing: '-0.01em'
          }}>
            Resume
          </div>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                flex: 1, padding: '14px 16px', border: '1px dashed var(--color-hairline)',
                borderRadius: 'var(--radius-sm)', background: 'var(--color-canvas-parchment)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {resumeName && (
                  <span style={{ fontSize: 20 }}>📄</span>
                )}
                <div>
                  <p className="t-caption" style={{ color: resumeName ? 'var(--color-ink)' : 'var(--color-ink-muted-48)', marginBottom: 2 }}>
                    {resumeName || 'No resume uploaded yet (PDF preferred)'}
                  </p>
                  {resumeName && (
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Uploaded · Jan 2024</p>
                  )}
                </div>
              </div>
              <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                onChange={e => {
                  const f = e.target.files[0];
                  if (f) { setResumeFile(f); setResumeName(f.name); }
                }} />
              <button type="button" className="btn-pearl" onClick={() => resumeRef.current?.click()}>
                {resumeName ? 'Replace' : 'Upload'}
              </button>
            </div>
          </div>
        </div>

        <button id="talent-profile-save" type="submit" className="btn-primary" disabled={saving} style={{ minWidth: 160 }}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
