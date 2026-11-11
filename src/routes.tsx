import { Navigate, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/home/HomeScreen';
import LogInScreen from './screens/log-in/LogInScreen';
import PlaceholderScreen from './screens/placeholder/PlaceholderScreen';
import ResetPasswordScreen from './screens/reset-password/ResetPasswordScreen';
import SignUpScreen from './screens/sign-up/SignUpScreen';

// Routes from IMPLEMENTATION_PLAN.md Section 8.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/sign-up" element={<SignUpScreen />} />
      <Route path="/log-in" element={<LogInScreen />} />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />
      {/* Placeholders, replaced by #12, #19, #20 and #23. */}
      <Route path="/faults" element={<PlaceholderScreen title="faults" issue={12} />} />
      <Route path="/queue" element={<PlaceholderScreen title="queue" issue={19} />} />
      <Route path="/my-jobs" element={<PlaceholderScreen title="myJobs" issue={20} />} />
      <Route path="/profile" element={<PlaceholderScreen title="profile" issue={23} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
