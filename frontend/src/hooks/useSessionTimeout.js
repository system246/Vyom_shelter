import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const WARNING_BEFORE_MS = 5 * 60 * 1000; // 5 mins before expiry

export const useSessionTimeout = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const warningRef = useRef(null);
  const logoutRef  = useRef(null);

  // Keep refs in sync with latest callbacks so setTimeout closures never go stale
  const logoutCbRef   = useRef(logout);
  const navigateCbRef = useRef(navigate);
  useEffect(() => { logoutCbRef.current   = logout;   }, [logout]);
  useEffect(() => { navigateCbRef.current = navigate; }, [navigate]);

  useEffect(() => {
    if (!token) return;
    try {
      const payload   = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const now       = Date.now();
      const warnAt    = expiresAt - WARNING_BEFORE_MS - now;
      const logoutAt  = expiresAt - now;

      if (warnAt > 0) {
        warningRef.current = setTimeout(() => {
          toast('Your session expires in 5 minutes. Save your work.', {
            duration: 30000, icon: '⚠️',
          });
        }, warnAt);
      }

      if (logoutAt > 0) {
        logoutRef.current = setTimeout(() => {
          logoutCbRef.current();
          navigateCbRef.current('/login');
          toast.error('Session expired. Please login again.');
        }, logoutAt);
      }
    } catch {}

    return () => { clearTimeout(warningRef.current); clearTimeout(logoutRef.current); };
  }, [token]);
};
