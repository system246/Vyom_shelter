import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Navbar  from './components/layout/Navbar';
import Footer  from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';
import { needsForm, isPending } from './routes/AppRoutes';
import { useSessionTimeout } from './hooks/useSessionTimeout';

function AppInner() {
  useSessionTimeout();
  const { user } = useAuth();

  // Logged in AND fully approved → sidebar layout
  const fullyActive = user && !needsForm(user) && !isPending(user);

  if (fullyActive) {
    return (
      <div className="flex min-h-screen bg-[#f0f4fa]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // Public / pending / needs-form → simple top-navbar layout
  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa]">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
