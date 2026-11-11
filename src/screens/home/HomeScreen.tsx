import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-primary">{t('app.name')}</h1>
      <p className="mt-2 text-text-secondary">{t('app.tagline')}</p>
    </main>
  );
}
