import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

// The sections of M7 and their paragraphs, in the order of PRD 8.2.
// Text is from PRD 12.4 in plain words.
const SECTIONS = [
  { title: 'collectTitle', items: ['collect1', 'collect2', 'collect3', 'collect4'] },
  { title: 'whyTitle', items: ['why1', 'why2', 'why3', 'why4', 'why5'] },
  { title: 'whoTitle', items: ['who1', 'who2', 'who3', 'who4'] },
  { title: 'whereTitle', items: ['where1'] },
  { title: 'keepTitle', items: ['keep1', 'keep2', 'keep3'] },
  { title: 'deleteTitle', items: ['delete1', 'delete2'] },
];

// M7 Privacy Notice (PRD 8.2, 12.4). Opened from S2 (and S11 in #23).
export default function PrivacyNoticeModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t('privacy.title')}
      onClose={onClose}
      tall
      icon={<ShieldCheck aria-hidden="true" className="mt-1 h-6 w-6 flex-none text-primary" />}
    >
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h3 className="mb-2 text-lg font-semibold text-secondary">
              {t(`privacy.${section.title}`)}
            </h3>
            <div className="space-y-2 text-base text-text">
              {section.items.map((item) => (
                <p key={item}>{t(`privacy.${item}`)}</p>
              ))}
            </div>
          </section>
        ))}
        <p className="rounded-card bg-surface p-4 text-base text-text">{t('privacy.contact')}</p>
        <Button onClick={onClose}>{t('privacy.close')}</Button>
      </div>
    </Modal>
  );
}
