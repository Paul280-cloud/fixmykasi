import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import FieldError from '../../components/FieldError';
import { inputClass } from '../../components/fieldStyles';
import Modal from '../../components/Modal';
import SelectField from '../../components/SelectField';
import TextField, { FieldLabel } from '../../components/TextField';
import {
  addDays,
  assignFault,
  getFieldTeams,
  MAX_DAYS,
  todaySast,
  validateAssign,
  type AssignErrors,
  type AssignForm,
  type FieldTeamOption,
} from '../../lib/assign';
import type { FaultCategory } from '../../lib/faults';
import { useOnline } from '../../lib/useOnline';

// What S5 / S8 pass in when the ward admin taps "Assign".
export type FaultToAssign = {
  id: string;
  referenceNumber: string;
  faultTypeName: string;
  streetAddress: string;
  category: FaultCategory;
  isAssigned: boolean; // true -> the button says "Reassign"
};

type Props = {
  fault: FaultToAssign;
  onClose: () => void;
  // S5 shows the toast "Fault assigned" and reloads the fault (PRD 8.2).
  onAssigned: () => void;
};

const EMPTY: AssignForm = {
  fieldTeamId: '',
  dueDate: '',
  estimatedDays: '',
  municipalReference: '',
  note: '',
};

// M2 Assign Fault (PRD 8.2, BR8, US7). Only the ward admin of the fault's ward
// gets here, and the database checks that again in assign_fault (#18).
export default function AssignFaultModal({ fault, onClose, onAssigned }: Props) {
  const { t } = useTranslation();
  const online = useOnline();
  const today = todaySast();

  const [teams, setTeams] = useState<FieldTeamOption[] | null>(null);
  const [teamsFailed, setTeamsFailed] = useState(false);
  const [form, setForm] = useState<AssignForm>(EMPTY);
  const [errors, setErrors] = useState<AssignErrors>({});
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const [saveError, setSaveError] = useState<'not_your_ward' | 'unknown' | null>(null);

  // Load only the teams that fix this kind of fault (BR8).
  useEffect(() => {
    let stillOpen = true;
    getFieldTeams(fault.category)
      .then((list) => {
        if (stillOpen) setTeams(list);
      })
      .catch(() => {
        if (stillOpen) setTeamsFailed(true);
      });
    return () => {
      stillOpen = false;
    };
  }, [fault.category]);

  function update(field: keyof AssignForm, value: string, errorKey: keyof AssignErrors) {
    setForm((current) => ({ ...current, [field]: value }));
    // I clear the error as soon as they change that field.
    setErrors((current) => ({ ...current, [errorKey]: undefined }));
    setSaveError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateAssign(form, today);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus('saving');
    const { error } = await assignFault(fault.id, form);
    setStatus('idle');

    if (!error) {
      onAssigned();
      return;
    }
    // If the database refused a field rule (someone was quicker than the
    // screen, e.g. the date rolled over at midnight), show it on the field.
    if (error === 'bad_due_date') setErrors({ dueDate: true });
    else if (error === 'bad_estimated_days') setErrors({ estimatedDays: true });
    else if (error === 'municipal_reference_too_long') setErrors({ municipalReference: true });
    else if (error === 'note_too_long') setErrors({ note: true });
    else if (error === 'wrong_team_category') setErrors({ fieldTeam: true });
    else setSaveError(error === 'not_your_ward' ? 'not_your_ward' : 'unknown');
  }

  const saving = status === 'saving';
  const noTeams = teams !== null && teams.length === 0;
  const categoryName = t(`reportFault.categories.${fault.category}`);
  const teamOptions = (teams ?? []).map((team) => ({
    value: team.id,
    label: `${team.name} (${t(`assignFault.kind.${team.kind}`)})`,
  }));

  return (
    <Modal title={t('assignFault.title', { reference: fault.referenceNumber })} onClose={onClose}>
      <form noValidate onSubmit={onSubmit} className="space-y-4">
        <p className="text-base text-text-secondary">
          {fault.faultTypeName}, {fault.streetAddress}
        </p>

        {saveError === 'not_your_ward' && <Banner tone="error">{t('assignFault.notYourWard')}</Banner>}
        {(saveError === 'unknown' || teamsFailed) && (
          <Banner tone="error">{t('common.somethingWentWrong')}</Banner>
        )}

        {teams === null && !teamsFailed && (
          <p role="status" className="text-base text-text-secondary">
            {t('common.loading')}
          </p>
        )}

        {noTeams && (
          <p role="status" className="text-base text-text-secondary">
            {t('assignFault.noTeams', { category: categoryName })}
          </p>
        )}

        <SelectField
          id="assign-team"
          label={t('assignFault.team')}
          placeholder={t('assignFault.teamPlaceholder')}
          options={teamOptions}
          value={form.fieldTeamId}
          disabled={saving || noTeams}
          onChange={(event) => update('fieldTeamId', event.target.value, 'fieldTeam')}
          error={errors.fieldTeam ? t('assignFault.teamError') : undefined}
        />

        <TextField
          id="assign-date"
          label={t('assignFault.dueDate')}
          type="date"
          // The date picker only offers today to 90 days from today (BR8).
          min={today}
          max={addDays(today, MAX_DAYS)}
          value={form.dueDate}
          disabled={saving}
          onChange={(event) => update('dueDate', event.target.value, 'dueDate')}
          error={errors.dueDate ? t('assignFault.dueDateError') : undefined}
        />

        <TextField
          id="assign-days"
          label={t('assignFault.days')}
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_DAYS}
          step={1}
          placeholder={t('assignFault.daysPlaceholder')}
          value={form.estimatedDays}
          disabled={saving}
          onChange={(event) => update('estimatedDays', event.target.value, 'estimatedDays')}
          error={errors.estimatedDays ? t('assignFault.daysError') : undefined}
        />

        <TextField
          id="assign-reference"
          label={t('assignFault.reference')}
          optional
          placeholder={t('assignFault.referencePlaceholder')}
          value={form.municipalReference}
          disabled={saving}
          onChange={(event) => update('municipalReference', event.target.value, 'municipalReference')}
          error={errors.municipalReference ? t('assignFault.referenceError') : undefined}
        />

        <div>
          <FieldLabel htmlFor="assign-note" label={t('assignFault.note')} optional />
          <textarea
            id="assign-note"
            rows={3}
            placeholder={t('assignFault.notePlaceholder')}
            value={form.note}
            disabled={saving}
            onChange={(event) => update('note', event.target.value, 'note')}
            aria-invalid={errors.note ? true : undefined}
            aria-describedby={errors.note ? 'assign-note-error' : undefined}
            className={`${inputClass(Boolean(errors.note))} h-auto py-3`}
          />
          {errors.note && <FieldError id="assign-note-error">{t('assignFault.noteError')}</FieldError>}
        </div>

        <Button type="submit" loading={saving} disabled={!online || noTeams || teams === null}>
          {fault.isAssigned ? t('assignFault.reassign') : t('assignFault.assign')}
        </Button>
        <Button variant="text" onClick={onClose} disabled={saving}>
          {t('assignFault.cancel')}
        </Button>
      </form>
    </Modal>
  );
}
