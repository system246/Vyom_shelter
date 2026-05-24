import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Navbar  from './components/layout/Navbar';
import Footer  from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { useAuth } from './context/AuthContext';

// Public pages use the top Navbar, logged-in pages use the Sidebar layout
function AppInner() {
  useSessionTimeout();
  const { user } = useAuth();

  if (user) {
    return (
      <div className="flex min-h-screen">
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

  return (
    <div className="min-h-screen flex flex-col">
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
