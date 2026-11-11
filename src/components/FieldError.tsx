import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

// Error text under a field: error colour, icon and message (PRD 8.3).
export default function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[13px] text-error">
      <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none" />
      <span>{children}</span>
    </p>
  );
}
