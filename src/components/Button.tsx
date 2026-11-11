import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'text';
  loading?: boolean;
};

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const styles = {
  primary:
    'bg-primary text-white hover:bg-[#004a20] disabled:bg-disabled disabled:text-disabled-text shadow-card',
  secondary:
    'border border-primary bg-white text-primary hover:bg-surface disabled:border-disabled disabled:text-disabled-text',
  text: 'text-primary hover:underline disabled:text-disabled-text',
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
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`relative flex min-h-12 w-full items-center justify-center rounded-button px-4 text-base font-semibold transition-colors disabled:cursor-not-allowed ${styles[variant]} ${focusRing} ${className}`}
      {...rest}
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
