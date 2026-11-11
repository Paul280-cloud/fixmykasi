import { BrowserRouter } from 'react-router-dom';
import './i18n';
import OfflineBanner from './components/OfflineBanner';
import { AuthProvider } from './lib/AuthProvider';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OfflineBanner />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
