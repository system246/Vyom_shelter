const BASE = import.meta.env.VITE_API_URL || '/api';

export const fetchProperties = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null))
  );
  try {
    const res = await fetch(`${BASE}/properties?${query}`);
    if (!res.ok) return { data: [], total: 0 };
    return await res.json();
  } catch { return { data: [], total: 0 }; }
};
