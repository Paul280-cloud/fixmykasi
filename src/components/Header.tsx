import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
  title: string;
  // Show the back arrow. It returns to the previous screen, or to
  // `backTo` when the screen was opened directly.
  showBack?: boolean;
  backTo?: string;
  right?: ReactNode;
};

// PRD 8.3 Header: Heritage Brown bar, white back arrow and title, and a
// 3 px gold line underneath. Sticks to the top when scrolling.
export default function Header({ title, showBack = false, backTo = '/', right }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  function goBack() {
    if (location.key === 'default') navigate(backTo);
    else navigate(-1);
  }

  return (
    <header className="sticky top-0 z-20 bg-secondary text-white">
      <div className="mx-auto flex h-14 max-w-content items-center gap-2 px-2 sm:px-4">
        {showBack ? (
          <button
            type="button"
            onClick={goBack}
            aria-label={t('common.goBack')}
            className="flex h-11 w-11 items-center justify-center rounded-button hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowLeft aria-hidden="true" className="h-6 w-6" />
          </button>
        ) : (
          <span className="w-2" aria-hidden="true" />
        )}
        <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
        {right}
      </div>
      <div className="h-[3px] bg-accent" />
    </header>
  );
}
