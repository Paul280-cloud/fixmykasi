import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import FieldError from './FieldError';
import { inputClass } from './fieldStyles';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  error?: ReactNode;
  optional?: boolean;
};

export function FieldLabel({
  htmlFor,
  label,
  optional,
}: {
  htmlFor: string;
  label: string;
  optional?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-1.5 flex items-baseline justify-between">
      <label htmlFor={htmlFor} className="text-base font-semibold text-text">
        {label}
        {!optional && (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {optional && <span className="text-[13px] text-text-secondary">{t('common.optional')}</span>}
    </div>
  );
}

// PRD 8.3 Text field: label above, field, error text below. A password
// field gets the show/hide eye button (PRD 5).
const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { id, label, error, optional = false, type = 'text', ...rest },
  ref,
) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const errorId = `${id}-error`;

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} optional={optional} />
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required={!optional}
          className={`${inputClass(Boolean(error))} ${isPassword ? 'pr-12' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? t('common.hidePassword') : t('common.showPassword')}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-input text-text-secondary hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {revealed ? (
              <EyeOff aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Eye aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
});

export default TextField;
