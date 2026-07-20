import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home              from '../pages/Home';
import Login             from '../pages/Login';
import Signup            from '../pages/Signup';
import VerifyOTP         from '../pages/VerifyOTP';
import ForgotPassword    from '../pages/ForgotPassword';
import RegisterAssociate from '../pages/RegisterAssociate';
import Success           from '../pages/Success';
import Report            from '../pages/Report';
import NotFound          from '../pages/NotFound';
import MyProfile         from '../pages/MyProfile';
import IDCard            from '../pages/IDCard';
import Dashboard         from '../pages/admin/Dashboard';
import AssociatesList    from '../pages/admin/AssociatesList';
import UsersList         from '../pages/admin/UsersList';
import CreateUser        from '../pages/admin/CreateUser';
import PendingApprovals  from '../pages/admin/PendingApprovals';
import ActivityLog       from '../pages/admin/ActivityLog';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"              element={<Home />} />
      <Route path="/login"         element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup"        element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/verify-otp"    element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/success"       element={<Success />} />

      <Route path="/register"      element={<PrivateRoute roles={['head_admin','admin']}><RegisterAssociate /></PrivateRoute>} />
      <Route path="/report"        element={<PrivateRoute><Report /></PrivateRoute>} />
      <Route path="/my-profile"    element={<PrivateRoute><MyProfile /></PrivateRoute>} />
      <Route path="/id-card"       element={<PrivateRoute><IDCard /></PrivateRoute>} />

      <Route path="/admin/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/admin/associates"   element={<PrivateRoute><AssociatesList /></PrivateRoute>} />
      <Route path="/admin/users"        element={<PrivateRoute roles={['head_admin','admin']}><UsersList /></PrivateRoute>} />
      <Route path="/admin/users/create" element={<PrivateRoute roles={['head_admin','admin']}><CreateUser /></PrivateRoute>} />
      <Route path="/admin/pending"      element={<PrivateRoute roles={['head_admin']}><PendingApprovals /></PrivateRoute>} />
      <Route path="/admin/activity"     element={<PrivateRoute roles={['head_admin']}><ActivityLog /></PrivateRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
