import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  // Full height on phones (M6, M7) instead of a bottom sheet.
  tall?: boolean;
  icon?: ReactNode;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// PRD 8.1 and 9.3: a bottom sheet on phones and tablets, centred and
// 480 px wide on desktop. Escape, the close button or a tap outside
// closes it. Focus stays inside while it is open and goes back after.
export default function Modal({ title, onClose, children, tall = false, icon }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current!;
    (dialog.querySelector<HTMLElement>('input, select, textarea') ?? dialog).focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center lg:items-center">
      <div
        className="absolute inset-0 bg-[rgba(28,28,28,0.55)]"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative flex w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-card focus:outline-none lg:w-[480px] lg:rounded-card ${
          tall ? 'h-[92vh] lg:h-auto lg:max-h-[85vh]' : 'max-h-[92vh]'
        }`}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border lg:hidden" aria-hidden="true" />
        <div className="flex items-start gap-3 px-4 pb-2 pt-4 sm:px-6">
          {icon}
          <h2 id={titleId} className="flex-1 text-2xl font-bold text-secondary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="-mr-2 -mt-2 flex h-11 w-11 flex-none items-center justify-center rounded-button text-text-secondary hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6 sm:px-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
