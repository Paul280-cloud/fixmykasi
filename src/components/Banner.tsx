import { CircleAlert, CircleCheck } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = { tone: 'success' | 'error'; children: ReactNode };

// Message banner at the top of a form (S3 banner area, form errors).
export default function Banner({ tone, children }: Props) {
  const success = tone === 'success';
  const Icon = success ? CircleCheck : CircleAlert;
  return (
    <div
      role={success ? 'status' : 'alert'}
      className={`flex items-start gap-2 rounded-card border p-3 text-base ${
        success ? 'border-success/30 bg-success/10 text-success' : 'border-error/30 bg-error/10 text-error'
      }`}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none" />
      <div className="text-text">{children}</div>
    </div>
  );
}
