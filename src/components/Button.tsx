import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { buttonClassName, type ButtonVariant } from './buttonStyles';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

// PRD 8.3 Primary / Secondary button (48 px high, 16 px semibold label).
// Loading: a spinner replaces the label and the button is disabled.
export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName(variant, className)}
    >
      {loading ? (
        <>
          <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin" />
          <span className="sr-only">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
