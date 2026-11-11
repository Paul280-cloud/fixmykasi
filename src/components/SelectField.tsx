import { ChevronDown } from 'lucide-react';
import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import FieldError from './FieldError';
import { inputClass } from './fieldStyles';
import { FieldLabel } from './TextField';

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  id: string;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  error?: ReactNode;
};

// Dropdown with the same look and error handling as the text field.
const SelectField = forwardRef<HTMLSelectElement, Props>(function SelectField(
  { id, label, placeholder, options, error, value, ...rest },
  ref,
) {
  const errorId = `${id}-error`;
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} />
      <div className="relative">
        <select
          ref={ref}
          id={id}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required="true"
          className={`${inputClass(Boolean(error))} appearance-none pr-10 ${value ? '' : 'text-text-secondary'}`}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-text">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary"
        />
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
});

export default SelectField;
