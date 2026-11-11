import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './i18n';
import HomeScreen from './screens/home/HomeScreen';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
