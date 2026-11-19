import { Navigate, Route, Routes } from 'react-router-dom';
import FaultListScreen from './screens/fault-list/FaultListScreen';
import HomeScreen from './screens/home/HomeScreen';
import LogInScreen from './screens/log-in/LogInScreen';
import MyJobsScreen from './screens/my-jobs/MyJobsScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import ReportFaultScreen from './screens/report-fault/ReportFaultScreen';
import ResetPasswordScreen from './screens/reset-password/ResetPasswordScreen';
import SignUpScreen from './screens/sign-up/SignUpScreen';
import WardQueueScreen from './screens/ward-queue/WardQueueScreen';

// Routes from IMPLEMENTATION_PLAN.md Section 8.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/sign-up" element={<SignUpScreen />} />
      <Route path="/log-in" element={<LogInScreen />} />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />
      <Route path="/report" element={<ReportFaultScreen />} />
      <Route path="/faults" element={<FaultListScreen />} />
      <Route path="/queue" element={<WardQueueScreen />} />
      <Route path="/my-jobs" element={<MyJobsScreen />} />
      {/* S11 Profile */}
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
