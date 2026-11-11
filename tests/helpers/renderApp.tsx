import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../../src/i18n';
import { AuthProvider } from '../../src/lib/AuthProvider';
import AppRoutes from '../../src/routes';
import OfflineBanner from '../../src/components/OfflineBanner';

type Entry = string | { pathname: string; search?: string; state?: unknown };

// Renders the real routes at one address, like opening that page.
export function renderApp(entry: Entry) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <AuthProvider>
        <OfflineBanner />
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  );
}

export function setOnline(online: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: online });
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}
