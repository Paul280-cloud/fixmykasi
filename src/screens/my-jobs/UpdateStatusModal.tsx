import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import FieldError from '../../components/FieldError';
import { inputClass } from '../../components/fieldStyles';
import Modal from '../../components/Modal';
import StatusChip from '../../components/StatusChip';
import { FieldLabel } from '../../components/TextField';
import type { FaultStatus } from '../../lib/faults';
import { MAX_NOTE, NEXT_STATUSES, updateJobStatus, type JobFault } from '../../lib/jobs';
import { useOnline } from '../../lib/useOnline';

type Props = {
  job: JobFault;
  onClose: () => void;
  // S10 shows the toast "Status updated" and reloads (PRD 8.2).
  onUpdated: () => void;
};

// M3 Update Status (PRD 8.2, US8), the small version for #20: the new status
// and a note. The "Mark as delayed" checkbox (BR12) and after photos (F6) come later.
export default function UpdateStatusModal({ job, onClose, onUpdated }: Props) {
  const { t } = useTranslation();
  const online = useOnline();
  const choices = NEXT_STATUSES[job.status];

  const [choice, setChoice] = useState<FaultStatus | ''>('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ status?: true; note?: true }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<'not_your_team' | 'unknown' | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found: { status?: true; note?: true } = {};
    if (!choice) found.status = true;
    if (note.trim().length > MAX_NOTE) found.note = true;
    setErrors(found);
    if (Object.keys(found).length > 0 || !choice) return;

    setSaving(true);
    const { error } = await updateJobStatus(job.id, choice, note);
    setSaving(false);

    if (!error) {
      onUpdated();
      return;
    }
    if (error === 'note_too_long') setErrors({ note: true });
    else setSaveError(error);
  }

  return (
    <Modal title={t('updateStatus.title', { reference: job.reference })} onClose={onClose}>
      <form noValidate onSubmit={onSubmit} className="space-y-4">
        <StatusChip status={job.status} />

        {saveError === 'not_your_team' && <Banner tone="error">{t('updateStatus.notYourTeam')}</Banner>}
        {saveError === 'unknown' && <Banner tone="error">{t('common.somethingWentWrong')}</Banner>}

        <fieldset aria-describedby={errors.status ? 'update-status-error' : undefined}>
          <legend className="mb-2 font-semibold">{t('updateStatus.newStatus')}</legend>
          <div className="space-y-2">
            {choices.map((status) => (
              <label key={status} className="flex min-h-12 items-center gap-3 rounded-input border border-border px-4">
                <input
                  type="radio"
                  name="new-status"
                  value={status}
                  checked={choice === status}
                  disabled={saving}
                  onChange={() => {
                    setChoice(status);
                    setErrors((current) => ({ ...current, status: undefined }));
                    setSaveError(null);
                  }}
                  className="h-5 w-5 accent-primary"
                />
                {t(`status.${status}`)}
              </label>
            ))}
          </div>
          {errors.status && <FieldError id="update-status-error">{t('updateStatus.statusError')}</FieldError>}
        </fieldset>

        <div>
          <FieldLabel htmlFor="update-note" label={t('updateStatus.note')} optional />
          <textarea
            id="update-note"
            rows={3}
            placeholder={t('updateStatus.notePlaceholder')}
            value={note}
            disabled={saving}
            onChange={(event) => {
              setNote(event.target.value);
              setErrors((current) => ({ ...current, note: undefined }));
            }}
            // The browser stops typing at 200, and the check on Save is still there
            // for anything longer (M3: up to 200 characters).
            maxLength={MAX_NOTE}
            aria-invalid={errors.note ? true : undefined}
            aria-describedby={errors.note ? 'update-note-hint update-note-error' : 'update-note-hint'}
            className={`${inputClass(Boolean(errors.note))} h-auto py-3`}
          />
          {/* Timeline notes are public (#51), so I warn the field team before they type. */}
          <p id="update-note-hint" className="mt-1 text-[13px] text-text-secondary">
            {t('updateStatus.noteHint')}
          </p>
          {errors.note && <FieldError id="update-note-error">{t('updateStatus.noteError')}</FieldError>}
        </div>

        <Button type="submit" loading={saving} disabled={!online}>
          {t('updateStatus.save')}
        </Button>
        <Button variant="text" onClick={onClose} disabled={saving}>
          {t('updateStatus.cancel')}
        </Button>
      </form>
    </Modal>
  );
}
