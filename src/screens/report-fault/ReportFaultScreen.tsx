import { Camera, TriangleAlert, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import FieldError from '../../components/FieldError';
import SelectField from '../../components/SelectField';
import TabScreen from '../../components/TabScreen';
import TextField, { FieldLabel } from '../../components/TextField';
import { inputClass } from '../../components/fieldStyles';
import { getWards, homeByRole, type Ward } from '../../lib/auth';
import { useAuth } from '../../lib/authContext';
import {
  CATEGORIES,
  getFaultTypes,
  getHomeWardId,
  submitReport,
  type FaultCategory,
  type FaultType,
  type ReportError,
} from '../../lib/faults';
import { checkPhoto, resizePhoto } from '../../lib/photo';
import { useOnline } from '../../lib/useOnline';

const MAX_PHOTOS = 3;
const MAX_DESCRIPTION = 500;

type Photo = { key: string; blob: Blob; url: string };

type Form = {
  notSafe: boolean;
  category: FaultCategory | '';
  faultTypeId: string;
  dangerous: boolean;
  wardId: string;
  street: string;
  landmark: string;
  useLocation: boolean;
  description: string;
};

type Field = 'photos' | 'category' | 'faultType' | 'ward' | 'street' | 'landmark' | 'description';

const FIELD_IDS: Record<Field, string> = {
  photos: 'report-photo-input',
  category: 'report-category',
  faultType: 'report-fault-type',
  ward: 'report-ward',
  street: 'report-street',
  landmark: 'report-landmark',
  description: 'report-description',
};

const EMPTY_FORM: Form = {
  notSafe: false,
  category: '',
  faultTypeId: '',
  dangerous: false,
  wardId: '',
  street: '',
  landmark: '',
  useLocation: true,
  description: '',
};

// South Africa only, the same range the faults table accepts (BR3).
function inSouthAfrica(latitude: number, longitude: number): boolean {
  return latitude >= -35 && latitude <= -22 && longitude >= 16 && longitude <= 33;
}

function previewUrl(blob: Blob): string {
  return typeof URL.createObjectURL === 'function' ? URL.createObjectURL(blob) : '';
}

// S6 Report a Fault (PRD 8.2, US3, BR2, BR3, BR17, BR19). M6 Similar reports
// and the AI chip come later, so the button is always "Submit report".
export default function ReportFaultScreen() {
  const { userId, role, ready } = useAuth();
  if (!ready) return null;
  if (!userId) return <Navigate to="/log-in" replace state={{ from: '/report' }} />;
  if (role !== 'resident') return <Navigate to={role ? homeByRole[role] : '/'} replace />;
  return <ReportFaultForm userId={userId} />;
}

function ReportFaultForm({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const online = useOnline();
  const fieldRefs = useRef<Partial<Record<Field, HTMLElement | null>>>({});

  const [faultTypes, setFaultTypes] = useState<FaultType[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState<string | undefined>();
  const [preparingPhoto, setPreparingPhoto] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({});
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationOff, setLocationOff] = useState(false);
  const askedForLocation = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reference?: string; error?: ReportError }>({});

  // Fault types, wards and the home ward (BR3: the ward defaults to it).
  useEffect(() => {
    let active = true;
    Promise.all([getFaultTypes(), getWards(), getHomeWardId(userId)])
      .then(([types, wardList, homeWardId]) => {
        if (!active) return;
        setFaultTypes(types);
        setWards(wardList);
        if (homeWardId) setForm((current) => ({ ...current, wardId: current.wardId || homeWardId }));
      })
      .catch(() => active && setLoadFailed(true));
    return () => {
      active = false;
    };
  }, [userId]);

  // BR3: ask the browser for GPS once per report. If refused, the report still works.
  useEffect(() => {
    if (!form.useLocation || askedForLocation.current) return;
    askedForLocation.current = true;
    if (!navigator.geolocation) {
      setLocationOff(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: position }) => {
        if (inSouthAfrica(position.latitude, position.longitude)) {
          setCoords({
            latitude: Number(position.latitude.toFixed(6)),
            longitude: Number(position.longitude.toFixed(6)),
          });
        }
      },
      () => setLocationOff(true),
      { timeout: 10000, maximumAge: 60000 },
    );
  }, [form.useLocation]);

  // Free the photo previews when they are removed or the screen closes.
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => photo.url && URL.revokeObjectURL?.(photo.url));
    },
    [],
  );

  const selectedType = faultTypes.find((type) => type.id === form.faultTypeId);
  const typesInCategory = faultTypes.filter((type) => type.category === form.category);
  const minDescription = form.notSafe ? 30 : 10;

  function update<K extends keyof Form>(key: K, value: Form[K], field?: Field) {
    setForm((current) => ({ ...current, [key]: value }));
    if (field) setErrors((current) => ({ ...current, [field]: false }));
    setResult({});
  }

  async function onChoosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const problem = checkPhoto(file);
    if (problem) {
      setPhotoError(t(problem === 'heic_not_supported' ? 'reportFault.photoHeic' : 'reportFault.photoTooBig'));
      return;
    }

    setPhotoError(undefined);
    setErrors((current) => ({ ...current, photos: false }));
    setPreparingPhoto(true);
    try {
      const blob = await resizePhoto(file);
      setPhotos((current) =>
        current.length >= MAX_PHOTOS
          ? current
          : [...current, { key: crypto.randomUUID(), blob, url: previewUrl(blob) }],
      );
    } catch {
      setPhotoError(t('reportFault.photoTooBig'));
    } finally {
      setPreparingPhoto(false);
    }
  }

  function removePhoto(key: string) {
    setPhotos((current) => {
      const photo = current.find((item) => item.key === key);
      if (photo?.url) URL.revokeObjectURL?.(photo.url);
      return current.filter((item) => item.key !== key);
    });
  }

  function validate(): Partial<Record<Field, boolean>> {
    const description = form.description.trim().length;
    const street = form.street.trim().length;
    return {
      photos: !form.notSafe && photos.length === 0,
      category: !form.category,
      faultType: !form.faultTypeId,
      ward: !form.wardId,
      street: street < 5 || street > 120,
      landmark: form.landmark.length > 60,
      description: description < minDescription || description > MAX_DESCRIPTION,
    };
  }

  async function onSubmit(event?: FormEvent) {
    event?.preventDefault();
    const found = validate();
    setErrors(found);
    const first = (Object.keys(FIELD_IDS) as Field[]).find((field) => found[field]);
    if (first) {
      fieldRefs.current[first]?.focus();
      return;
    }

    setSubmitting(true);
    setResult({});
    const outcome = await submitReport(
      {
        wardId: form.wardId,
        faultTypeId: form.faultTypeId,
        isUrgent: form.dangerous || Boolean(selectedType?.autoUrgent),
        noPhotoSafe: form.notSafe,
        description: form.description,
        streetAddress: form.street,
        landmark: form.landmark,
        latitude: form.useLocation ? (coords?.latitude ?? null) : null,
        longitude: form.useLocation ? (coords?.longitude ?? null) : null,
      },
      form.notSafe ? [] : photos.map((photo) => photo.blob),
    );
    setSubmitting(false);
    setResult(outcome);

    if (outcome.reference) {
      // S5 comes with the read-only S5 base; until then S6 shows the reference
      // number and starts a fresh report in the same ward.
      photos.forEach((photo) => photo.url && URL.revokeObjectURL?.(photo.url));
      setPhotos([]);
      setForm((current) => ({ ...EMPTY_FORM, wardId: current.wardId, useLocation: current.useLocation }));
      window.scrollTo?.({ top: 0 });
    }
  }

  const checkboxClass = 'mt-0.5 h-6 w-6 flex-none cursor-pointer rounded accent-primary disabled:cursor-not-allowed';

  return (
    <TabScreen title={t('reportFault.title')}>
      <form noValidate onSubmit={onSubmit} className="mx-auto max-w-md space-y-5">
        {result.reference && (
          <Banner tone="success">{t('reportFault.success', { reference: result.reference })}</Banner>
        )}
        {result.error && (
          <Banner tone="error">
            <p>{t(result.error === 'too_many_reports' ? 'reportFault.limitReached' : 'reportFault.uploadFailed')}</p>
            {result.error !== 'too_many_reports' && (
              <button
                type="button"
                onClick={() => void onSubmit()}
                disabled={!online}
                className="mt-1 min-h-11 font-semibold text-primary underline underline-offset-2 disabled:text-disabled-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {t('common.tryAgain')}
              </button>
            )}
          </Banner>
        )}
        {loadFailed && <Banner tone="error">{t('common.somethingWentWrong')}</Banner>}

        <div className="flex items-start gap-2 rounded-card border border-accent bg-accent/15 p-3 text-base text-text">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none" />
          <p>{t('reportFault.emergency')}</p>
        </div>

        {/* Photos (BR2) */}
        <fieldset>
          <legend className="mb-1.5 text-base font-semibold text-text">
            {t('reportFault.photos')}
            {!form.notSafe && (
              <span className="text-error" aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </legend>
          {!form.notSafe && (
            <>
              <p className="mb-2 text-[13px] text-text-secondary">{t('reportFault.photoHint')}</p>
              <ul className="grid grid-cols-3 gap-2" aria-live="polite">
                {photos.map((photo, index) => (
                  <li key={photo.key} className="relative aspect-square overflow-hidden rounded-photo bg-surface">
                    <img
                      src={photo.url}
                      alt={t('reportFault.photoAlt', { number: index + 1 })}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.key)}
                      aria-label={t('reportFault.removePhoto', { number: index + 1 })}
                      className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-text/70 text-white">
                        <X aria-hidden="true" className="h-4 w-4" />
                      </span>
                    </button>
                  </li>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <li className="aspect-square">
                    <label
                      htmlFor={FIELD_IDS.photos}
                      className={`flex h-full cursor-pointer flex-col items-center justify-center gap-1 rounded-photo border-2 border-dashed text-[13px] font-semibold text-primary hover:bg-surface focus-within:outline focus-within:outline-2 focus-within:outline-primary ${
                        errors.photos ? 'border-error' : 'border-border'
                      }`}
                    >
                      <Camera aria-hidden="true" className="h-6 w-6" />
                      <span>{preparingPhoto ? t('reportFault.preparingPhoto') : t('reportFault.addPhoto')}</span>
                      <input
                        ref={(element) => {
                          fieldRefs.current.photos = element;
                        }}
                        id={FIELD_IDS.photos}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="sr-only"
                        disabled={preparingPhoto}
                        aria-invalid={errors.photos || photoError ? true : undefined}
                        aria-describedby={errors.photos || photoError ? `${FIELD_IDS.photos}-error` : undefined}
                        onChange={onChoosePhoto}
                      />
                    </label>
                  </li>
                )}
              </ul>
              {(photoError || errors.photos) && (
                <FieldError id={`${FIELD_IDS.photos}-error`}>{photoError ?? t('reportFault.photoRequired')}</FieldError>
              )}
            </>
          )}
          <div className="mt-2 flex min-h-11 items-start gap-3">
            <input
              id="report-not-safe"
              type="checkbox"
              checked={form.notSafe}
              onChange={(event) => {
                update('notSafe', event.target.checked);
                setErrors((current) => ({ ...current, photos: false, description: false }));
                setPhotoError(undefined);
              }}
              className={checkboxClass}
            />
            <label htmlFor="report-not-safe" className="cursor-pointer text-base text-text">
              {t('reportFault.notSafe')}
            </label>
          </div>
        </fieldset>

        <SelectField
          ref={(element) => {
            fieldRefs.current.category = element;
          }}
          id={FIELD_IDS.category}
          label={t('reportFault.category')}
          placeholder={t('reportFault.categoryPlaceholder')}
          options={CATEGORIES.map((category) => ({ value: category, label: t(`reportFault.categories.${category}`) }))}
          value={form.category}
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              category: event.target.value as FaultCategory,
              faultTypeId: '',
              dangerous: false,
            }));
            setErrors((current) => ({ ...current, category: false }));
            setResult({});
          }}
          error={errors.category ? t('reportFault.categoryError') : undefined}
        />

        <SelectField
          ref={(element) => {
            fieldRefs.current.faultType = element;
          }}
          id={FIELD_IDS.faultType}
          label={t('reportFault.faultType')}
          placeholder={t('reportFault.faultTypePlaceholder')}
          options={typesInCategory.map((type) => ({ value: type.id, label: type.name }))}
          value={form.faultTypeId}
          disabled={!form.category}
          onChange={(event) => {
            const type = faultTypes.find((item) => item.id === event.target.value);
            setForm((current) => ({ ...current, faultTypeId: event.target.value, dangerous: Boolean(type?.autoUrgent) }));
            setErrors((current) => ({ ...current, faultType: false }));
            setResult({});
          }}
          error={errors.faultType ? t('reportFault.faultTypeError') : undefined}
        />

        {/* BR19: auto urgent fault types are ticked and locked. */}
        <div>
          <div className="flex min-h-11 items-start gap-3">
            <input
              id="report-dangerous"
              type="checkbox"
              checked={form.dangerous || Boolean(selectedType?.autoUrgent)}
              disabled={Boolean(selectedType?.autoUrgent)}
              onChange={(event) => update('dangerous', event.target.checked)}
              aria-describedby={selectedType?.autoUrgent ? 'report-dangerous-note' : undefined}
              className={checkboxClass}
            />
            <label htmlFor="report-dangerous" className="cursor-pointer text-base text-text">
              {t('reportFault.dangerous')}
            </label>
          </div>
          {selectedType?.autoUrgent && (
            <p id="report-dangerous-note" className="ml-9 text-[13px] text-text-secondary">
              {t('reportFault.alwaysUrgent')}
            </p>
          )}
        </div>

        <SelectField
          ref={(element) => {
            fieldRefs.current.ward = element;
          }}
          id={FIELD_IDS.ward}
          label={t('reportFault.ward')}
          placeholder={t('reportFault.wardPlaceholder')}
          options={wards.map((ward) => ({ value: ward.id, label: ward.name }))}
          value={form.wardId}
          onChange={(event) => update('wardId', event.target.value, 'ward')}
          error={errors.ward ? t('reportFault.wardError') : undefined}
        />

        <TextField
          ref={(element) => {
            fieldRefs.current.street = element;
          }}
          id={FIELD_IDS.street}
          label={t('reportFault.street')}
          placeholder={t('reportFault.streetPlaceholder')}
          autoComplete="street-address"
          maxLength={120}
          value={form.street}
          onChange={(event) => update('street', event.target.value, 'street')}
          error={errors.street ? t('reportFault.streetError') : undefined}
        />

        <TextField
          ref={(element) => {
            fieldRefs.current.landmark = element;
          }}
          id={FIELD_IDS.landmark}
          label={t('reportFault.landmark')}
          placeholder={t('reportFault.landmarkPlaceholder')}
          optional
          value={form.landmark}
          onChange={(event) => update('landmark', event.target.value, 'landmark')}
          error={errors.landmark ? t('reportFault.landmarkError') : undefined}
        />

        <div>
          <div className="flex min-h-11 items-start gap-3">
            <input
              id="report-use-location"
              type="checkbox"
              role="switch"
              checked={form.useLocation}
              onChange={(event) => update('useLocation', event.target.checked)}
              aria-describedby={locationOff ? 'report-location-note' : undefined}
              className={checkboxClass}
            />
            <label htmlFor="report-use-location" className="cursor-pointer text-base text-text">
              {t('reportFault.useLocation')}
            </label>
          </div>
          {locationOff && form.useLocation && (
            <p id="report-location-note" className="ml-9 text-[13px] text-text-secondary">
              {t('reportFault.locationOff')}
            </p>
          )}
        </div>

        <div>
          <FieldLabel htmlFor={FIELD_IDS.description} label={t('reportFault.description')} />
          <textarea
            ref={(element) => {
              fieldRefs.current.description = element;
            }}
            id={FIELD_IDS.description}
            rows={4}
            maxLength={MAX_DESCRIPTION}
            placeholder={t('reportFault.descriptionPlaceholder')}
            value={form.description}
            onChange={(event) => update('description', event.target.value, 'description')}
            aria-required="true"
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={`${FIELD_IDS.description}-count${errors.description ? ` ${FIELD_IDS.description}-error` : ''}`}
            className={`${inputClass(Boolean(errors.description))} h-auto min-h-28 py-3`}
          />
          <div className="mt-1 flex items-start justify-between gap-2">
            <div>
              {errors.description && (
                <FieldError id={`${FIELD_IDS.description}-error`}>
                  {t('reportFault.descriptionError', { min: minDescription })}
                </FieldError>
              )}
            </div>
            <p id={`${FIELD_IDS.description}-count`} className="flex-none text-[13px] text-text-secondary">
              {form.description.length} / {MAX_DESCRIPTION}
            </p>
          </div>
        </div>

        <Button type="submit" loading={submitting} disabled={!online || preparingPhoto}>
          {submitting ? t('reportFault.uploading') : t('reportFault.submit')}
        </Button>
      </form>
    </TabScreen>
  );
}
