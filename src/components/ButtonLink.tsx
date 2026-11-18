import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { buttonClassName } from './buttonStyles';

type Props = { to: string; variant?: 'primary' | 'secondary'; children: ReactNode };

// A link that looks exactly like a Button (PRD 8.3). Use it when tapping only
// goes to another screen: screen readers then say "link", which is true.
export default function ButtonLink({ to, variant = 'primary', children }: Props) {
  return (
    <Link to={to} className={buttonClassName(variant)}>
      {children}
    </Link>
  );
}
