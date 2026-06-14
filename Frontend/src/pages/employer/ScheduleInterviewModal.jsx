import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/useAuth';
import toast from 'react-hot-toast';

const DURATIONS = [30, 45, 60, 90];

export default function ScheduleInterviewModal({ application, onClose, onSaved }) {
  const { supabase } = useAuth();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  async function onSubmit(values) {
    setSaving(true);
    try {
      const scheduled = new Date(`${values.date}T${values.time}`).toISOString();

      const { error } = await supabase.from('interviews').insert({
        application_id: application.id,
        scheduled_at: scheduled,
        duration_min: Number(values.duration),
        meeting_link: values.meeting_link || null,
        notes: values.notes || null,
      });
      if (error) throw error;

      // Update application status
      await supabase
        .from('applications')
        .update({ status: 'interview_scheduled' })
        .eq('id', application.id);

      // Create notification for talent
      const talentUserId = application.talent_profiles?.user_id;
      if (talentUserId) {
        await supabase.from('notifications').insert({
          user_id: talentUserId,
          type: 'interview_scheduled',
          reference_id: application.id,
          read: false,
        });
      }

      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2>Schedule Interview</h2>
          <button className="btn-icon-circular" onClick={onClose} style={{ width: 32, height: 32 }}>✕</button>
        </div>

        <p className="t-caption" style={{ color: 'var(--color-ink-muted-48)', marginBottom: 24 }}>
          For: <strong>{application.talent_profiles?.profiles?.full_name || 'Applicant'}</strong>
          {' '}— {application.job_postings?.title}
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="int-date">Date *</label>
              <input id="int-date" type="date" className={`form-input ${errors.date ? 'error' : ''}`}
                min={new Date().toISOString().split('T')[0]}
                {...register('date', { required: 'Date is required' })} />
              {errors.date && <span className="form-error">{errors.date.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="int-time">Time *</label>
              <input id="int-time" type="time" className={`form-input ${errors.time ? 'error' : ''}`}
                {...register('time', { required: 'Time is required' })} />
              {errors.time && <span className="form-error">{errors.time.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="int-duration">Duration</label>
            <select id="int-duration" className="form-select" {...register('duration')}>
              {DURATIONS.map(d => <option key={d} value={d}>{d} minutes</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="int-link">Meeting Link (optional)</label>
            <input id="int-link" type="url" className="form-input"
              placeholder="https://meet.google.com/…"
              {...register('meeting_link')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="int-notes">Notes (optional)</label>
            <textarea id="int-notes" className="form-textarea" rows={3}
              placeholder="Topics to cover, prep notes…"
              {...register('notes')} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button id="schedule-save" type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Scheduling…' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
