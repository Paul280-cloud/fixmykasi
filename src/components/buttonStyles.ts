// PRD 8.3 button look, shared by Button (a <button>) and ButtonLink (a link),
// so a link that looks like a button is always exactly the same.

export type ButtonVariant = 'primary' | 'secondary' | 'text';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const styles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-[#004a20] disabled:bg-disabled disabled:text-disabled-text shadow-card',
  secondary:
    'border border-primary bg-white text-primary hover:bg-surface disabled:border-disabled disabled:text-disabled-text',
  text: 'text-primary hover:underline disabled:text-disabled-text',
};

export function buttonClassName(variant: ButtonVariant, className = ''): string {
  return `relative flex min-h-12 w-full items-center justify-center rounded-button px-4 text-base font-semibold transition-colors disabled:cursor-not-allowed ${styles[variant]} ${focusRing} ${className}`;
}
