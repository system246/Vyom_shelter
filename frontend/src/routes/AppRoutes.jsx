import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Seo from '../components/seo/Seo';

const Home              = lazy(() => import('../pages/Home'));
const Login             = lazy(() => import('../pages/Login'));
const Signup            = lazy(() => import('../pages/Signup'));
const VerifyOTP         = lazy(() => import('../pages/VerifyOTP'));
const ForgotPassword    = lazy(() => import('../pages/ForgotPassword'));
const RegisterAssociate = lazy(() => import('../pages/RegisterAssociate'));
const Success           = lazy(() => import('../pages/Success'));
const Report            = lazy(() => import('../pages/Report'));
const NotFound          = lazy(() => import('../pages/NotFound'));
const MyProfile         = lazy(() => import('../pages/MyProfile'));
const IDCard            = lazy(() => import('../pages/IDCard'));
const Dashboard         = lazy(() => import('../pages/admin/Dashboard'));
const AssociatesList    = lazy(() => import('../pages/admin/AssociatesList'));
const UsersList         = lazy(() => import('../pages/admin/UsersList'));
const CreateUser        = lazy(() => import('../pages/admin/CreateUser'));
const PendingApprovals  = lazy(() => import('../pages/admin/PendingApprovals'));
const ActivityLog       = lazy(() => import('../pages/admin/ActivityLog'));
const PropertiesAdmin   = lazy(() => import('../pages/admin/PropertiesAdmin'));
const EnquiriesAdmin    = lazy(() => import('../pages/admin/EnquiriesAdmin'));
const Properties        = lazy(() => import('../pages/properties/Properties'));
const PropertyDetail    = lazy(() => import('../pages/properties/PropertyDetail'));
const ListProperty      = lazy(() => import('../pages/properties/ListProperty'));
const Services          = lazy(() => import('../pages/services/Services'));
const ServicesAdmin     = lazy(() => import('../pages/admin/ServicesAdmin'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">Loading...</div>
);

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
  return (
    <>
      <Seo noindex title="Account" />
      {children}
    </>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/admin/dashboard" replace />;
  return (
    <>
      <Seo noindex title="Account" />
      {children}
    </>
  );
};

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"              element={<Home />} />

        {/* Public property flows — Buy / Sell / Rent — NO login required */}
        <Route path="/properties"      element={<Properties />} />
        <Route path="/properties/:id"  element={<PropertyDetail />} />
        <Route path="/sell"            element={<ListProperty />} />

        {/* Our Services — public browse, head_admin manage */}
        <Route path="/services"        element={<Services />} />
        <Route path="/admin/services"  element={<PrivateRoute roles={['head_admin']}><ServicesAdmin /></PrivateRoute>} />

        <Route path="/login"         element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup"        element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/verify-otp"    element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/success"       element={<Success />} />

        {/* All logged-in roles can reach /register — associates fill their own
            form here; admin/head_admin can register a walk-in associate. */}
        <Route path="/register"      element={<PrivateRoute><RegisterAssociate /></PrivateRoute>} />
        <Route path="/report"        element={<PrivateRoute><Report /></PrivateRoute>} />
        <Route path="/my-profile"    element={<PrivateRoute><MyProfile /></PrivateRoute>} />
        <Route path="/id-card"       element={<PrivateRoute><IDCard /></PrivateRoute>} />

        <Route path="/admin/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin/associates"   element={<PrivateRoute><AssociatesList /></PrivateRoute>} />
        <Route path="/admin/users"        element={<PrivateRoute roles={['head_admin','admin']}><UsersList /></PrivateRoute>} />
        <Route path="/admin/users/create" element={<PrivateRoute roles={['head_admin','admin']}><CreateUser /></PrivateRoute>} />
        <Route path="/admin/pending"      element={<PrivateRoute roles={['head_admin']}><PendingApprovals /></PrivateRoute>} />
        <Route path="/admin/activity"     element={<PrivateRoute roles={['head_admin']}><ActivityLog /></PrivateRoute>} />
        <Route path="/admin/properties"   element={<PrivateRoute><PropertiesAdmin /></PrivateRoute>} />
        <Route path="/admin/enquiries"    element={<PrivateRoute><EnquiriesAdmin /></PrivateRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
