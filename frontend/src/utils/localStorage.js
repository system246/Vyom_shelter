import { DRAFT_KEY } from './constants';

// Auto-generates the new candidate's own referral code — never typed by the user.
// Persisted alongside the draft so it stays stable across the wizard / a page refresh.
export const generateCandidateRefNo = () =>
  'NEW-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100);

export const saveDraft = (data) => {
  try {
    // Don't save File objects to localStorage
    const safe = JSON.parse(JSON.stringify(data, (key, val) => {
      if (val instanceof File) return undefined;
      return val;
    }));
    localStorage.setItem(DRAFT_KEY, JSON.stringify(safe));
    return true;
  } catch {
    return false;
  }
};

export const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY);
};

export const hasDraft = () => {
  return !!localStorage.getItem(DRAFT_KEY);
};
