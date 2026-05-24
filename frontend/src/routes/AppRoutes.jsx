import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home              from '../pages/Home';
import Login             from '../pages/Login';
import Signup            from '../pages/Signup';
import VerifyOTP         from '../pages/VerifyOTP';
import ForgotPassword    from '../pages/ForgotPassword';
import RegisterAssociate from '../pages/RegisterAssociate';
import AwaitingApproval  from '../pages/AwaitingApproval';
import Success           from '../pages/Success';
import Report            from '../pages/Report';
import NotFound          from '../pages/NotFound';
import MyProfile         from '../pages/MyProfile';
import IDCard            from '../pages/IDCard';
import Dashboard         from '../pages/admin/Dashboard';
import AssociatesList    from '../pages/admin/AssociatesList';
import UsersList         from '../pages/admin/UsersList';
import CreateAdmin       from '../pages/admin/CreateAdmin';
import PendingApprovals  from '../pages/admin/PendingApprovals';
import ActivityLog       from '../pages/admin/ActivityLog';

const effectiveRoles = (user) =>
  user ? [...new Set([user.role, ...(user.roles || [])])] : [];

// Self-registered associate who hasn't submitted the form yet
const needsForm = (user) =>
  user?.isSelfRegistered && !user?.associateRecordId;

// Self-registered associate who submitted form but pending approval
const isPending = (user) =>
  user?.isSelfRegistered && user?.associateRecordId && !user?.isApproved;

// We store approval status on the user via a flag set after admin approves
// For now use: isSelfRegistered + associateRecordId present = submitted, pending admin
// After admin approves the associate form, we mark user.associateApproved = true (handled separately)
// Simple check: if isSelfRegistered, no access to dashboard etc until head_admin approves

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">Loading…</div>;
  if (!user)   return <Navigate to="/login" replace />;

  // Must fill registration form first
  if (needsForm(user)) return <Navigate to="/register" replace />;

  // Form submitted but not yet approved — only allow /awaiting-approval
  if (isPending(user)) return <Navigate to="/awaiting-approval" replace />;

  if (roles) {
    const userRoles = effectiveRoles(user);
    if (!roles.some(r => userRoles.includes(r))) return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return children;
  if (needsForm(user)) return <Navigate to="/register" replace />;
  if (isPending(user)) return <Navigate to="/awaiting-approval" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

// Register route — for self-registered users filling their form, or admins registering others
const RegisterRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  // If already submitted and pending, go to awaiting
  if (isPending(user)) return <Navigate to="/awaiting-approval" replace />;
  return <RegisterAssociate />;
};

// Awaiting approval — only for pending self-registered users
const ApprovalRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (needsForm(user)) return <Navigate to="/register" replace />;
  if (!isPending(user)) return <Navigate to="/admin/dashboard" replace />;
  return <AwaitingApproval />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                element={<Home />} />
      <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup"          element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/verify-otp"      element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/success"         element={<Success />} />

      <Route path="/awaiting-approval" element={<ApprovalRoute />} />
      <Route path="/register"          element={<RegisterRoute />} />

      <Route path="/report"     element={<PrivateRoute><Report /></PrivateRoute>} />
      <Route path="/my-profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
      <Route path="/id-card"    element={<PrivateRoute><IDCard /></PrivateRoute>} />

      <Route path="/admin/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/admin/associates"   element={<PrivateRoute><AssociatesList /></PrivateRoute>} />
      <Route path="/admin/users"        element={<PrivateRoute roles={['head_admin','admin']}><UsersList /></PrivateRoute>} />
      <Route path="/admin/users/create" element={<PrivateRoute roles={['head_admin']}><CreateAdmin /></PrivateRoute>} />
      <Route path="/admin/pending"      element={<PrivateRoute roles={['head_admin']}><PendingApprovals /></PrivateRoute>} />
      <Route path="/admin/activity"     element={<PrivateRoute roles={['head_admin']}><ActivityLog /></PrivateRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
