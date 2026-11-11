import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import FieldError from './FieldError';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  id: string;
  label: ReactNode;
  error?: ReactNode;
};

// Required checkbox with its label and error (S2: 18+ and Privacy Notice).
const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox(
  { id, label, error, ...rest },
  ref,
) {
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="flex min-h-11 items-start gap-3">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required="true"
          className={`mt-0.5 h-6 w-6 flex-none cursor-pointer rounded accent-primary ${error ? 'outline outline-2 outline-error' : ''}`}
          {...rest}
        />
        <label htmlFor={id} className="cursor-pointer text-base text-text">
          {label}
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        </label>
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
});

export default Checkbox;
