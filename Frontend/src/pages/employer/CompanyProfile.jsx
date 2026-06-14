import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';

const INDUSTRIES = ['Technology','Finance','Healthcare','Oil & Gas','Education','Retail','Manufacturing','Consulting','Media','Government','Other'];
const SIZES = ['1–10','11–50','51–200','201–500','500+'];

const SAMPLE_DATA = {
  name: 'TechCorp Solutions Sdn. Bhd.',
  industry: 'Technology',
  size: '51–200',
  founded_year: 2018,
  hq: 'Kuala Lumpur, Malaysia',
  website: 'www.techcorpsolutions.my',
  phone: '+60 3-1234 5678',
  description: 'TechCorp Solutions is a leading software development firm serving enterprises across Southeast Asia. We specialize in cloud-native applications, AI-driven analytics, and digital transformation consulting. Our team of 120+ engineers is driven by a culture of continuous learning, innovation, and customer obsession. We believe in building technology that makes a meaningful difference.',
  linkedin: 'linkedin.com/company/techcorp-solutions',
  facebook: 'facebook.com/techcorpsolutions',
};

export default function CompanyProfile() {
  const { supabase, user } = useAuth();
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile]       = useState(null);
  const [hasData, setHasData]         = useState(false);
  const fileRef = useRef(null);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: SAMPLE_DATA,
  });

  const companyName = watch('name') || '';
  const industry = watch('industry') || '';
  const hq = watch('hq') || '';
  const foundedYear = watch('founded_year') || '';
  const initials = companyName
    .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'TC';

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      if (data) {
        reset({ ...SAMPLE_DATA, ...data });
        if (data.logo_url) setLogoPreview(data.logo_url);
        setHasData(true);
      } else {
        reset(SAMPLE_DATA);
      }
      setLoading(false);
    }
    load();
  }, [user, supabase, reset]);

  async function onSubmit(values) {
    setSaving(true);
    try {
      let logoUrl = values.logo_url || null;
      if (logoFile) {
        const path = `logos/${user.id}/${logoFile.name}`;
        const { error: upErr } = await supabase.storage.from('logos').upload(path, logoFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
          logoUrl = urlData.publicUrl;
        }
      }
      const payload = { ...values, logo_url: logoUrl, owner_id: user.id };
      const { error } = await supabase.from('companies').upsert(payload, { onConflict: 'owner_id' });
      if (error) throw error;
      toast.success('Company profile saved!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 18 }} />;

  return (
    <div>
      <div className="page-header">
        <h1>Company Profile</h1>
        <p>This information is displayed to talent browsing your job postings</p>
      </div>

      {/* Profile preview hero */}
      <div className="profile-hero" style={{ marginBottom: 28 }}>
        {/* Cover strip */}
        <div className="profile-hero__cover" />
        <div className="profile-hero__body">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            {/* Logo / Initials */}
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              border: '3px solid rgba(13,17,23,0.9)',
              background: logoPreview ? 'transparent' : 'linear-gradient(135deg, #3B3BA3 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: '#fff',
              marginTop: -36, flexShrink: 0, overflow: 'hidden',
            }}>
              {logoPreview
                ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>

            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff', margin: 0 }}>
                  {companyName || 'Your Company'}
                </p>
                <span className="badge-verified">✓ Verified employer</span>
              </div>
              <p className="t-caption" style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
                {[industry, hq, foundedYear ? `Founded ${foundedYear}` : ''].filter(Boolean).join(' · ') || 'New Company'}
              </p>
            </div>

            <span style={{
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc', fontSize: 12, fontWeight: 700,
              padding: '4px 12px', borderRadius: 999,
            }}>
              12 open roles
            </span>
          </div>

          {/* Profile completeness */}
          <div className="completeness-bar" style={{ marginTop: 16 }}>
            <div className="completeness-bar__label">
              <span>Profile completeness</span>
              <span style={{ color: 'var(--color-ai)', fontWeight: 600 }}>75%</span>
            </div>
            <div className="completeness-bar__track">
              <div className="completeness-bar__fill" style={{ width: '75%' }} />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 5 }}>
              Add your culture photos to reach 100%
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Logo upload */}
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden', maxWidth: 680 }}>
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
            Company Logo
          </div>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 18,
                background: logoPreview ? 'transparent' : 'linear-gradient(135deg, #3B3BA3 0%, #6366f1 100%)',
                border: '1px solid var(--color-hairline)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 700, color: '#fff',
              }}>
                {logoPreview
                  ? <img src={logoPreview} alt="Company logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials
                }
              </div>
              <div>
                <input id="logo-upload" ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
                  }} />
                <button type="button" className="btn-pearl" onClick={() => fileRef.current?.click()}>
                  Upload Logo
                </button>
                <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)', marginTop: 6 }}>PNG, JPG up to 5 MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Basic info */}
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
            Basic Information
          </div>
          <div style={{ padding: '24px 28px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="company-name">Company Name *</label>
              <input id="company-name" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Acme Corp"
                {...register('name', { required: 'Company name is required' })} />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="company-industry">Industry</label>
                <select id="company-industry" className="form-select" {...register('industry')}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="company-size">Company Size</label>
                <select id="company-size" className="form-select" {...register('size')}>
                  <option value="">Select size</option>
                  {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="company-hq">HQ Location</label>
                <input id="company-hq" className="form-input" placeholder="Kuala Lumpur, Malaysia" {...register('hq')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="company-founded">Founded Year</label>
                <input id="company-founded" type="number" className="form-input" placeholder="2020" {...register('founded_year')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="company-website">Website</label>
              <input id="company-website" className="form-input" placeholder="https://acme.com" {...register('website')} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="company-phone">Phone</label>
              <input id="company-phone" className="form-input" placeholder="+60 3-1234 5678" {...register('phone')} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="company-description">About</label>
              <textarea id="company-description" className="form-textarea" rows={4}
                placeholder="Tell talent about your company, mission, and culture…"
                {...register('description')} />
            </div>
          </div>
        </div>

        {/* Social links */}
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
            Social Links
          </div>
          <div style={{ padding: '24px 28px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="company-linkedin">
                <span style={{ marginRight: 8 }}>in</span> LinkedIn
              </label>
              <input id="company-linkedin" className="form-input" placeholder="linkedin.com/company/yourcompany"
                {...register('linkedin')} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="company-facebook">
                <span style={{ marginRight: 8 }}>f</span> Facebook
              </label>
              <input id="company-facebook" className="form-input" placeholder="facebook.com/yourcompany"
                {...register('facebook')} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="company-instagram">
                <span style={{ marginRight: 8 }}>f</span> Instagram
              </label>
              <input id="company-instagram" className="form-input" placeholder="instagram.com/yourcompany"
                {...register('instagram')} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="company-websites">
                <span style={{ marginRight: 8 }}>f</span> Websites
              </label>
              <input id="company-websites" className="form-input" placeholder="websites.com/yourcompany"
                {...register('websites')} />
            </div>
          </div>
        </div>

        <button id="company-save" type="submit" className="btn-primary" disabled={saving} style={{ minWidth: 160 }}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
