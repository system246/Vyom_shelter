const BASE = '/api';

// ---------- PUBLIC ----------

export const fetchServices = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null))
  );
  const res  = await fetch(`${BASE}/services?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load services');
  return data;
};

// ---------- ADMIN (head_admin only) ----------

export const fetchAllServicesAdmin = async (authFetch, { status } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const res  = await authFetch(`${BASE}/services/admin/all?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const addServiceApi = async (authFetch, formData) => {
  const res  = await authFetch(`${BASE}/services`, { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add service');
  return data;
};

export const updateServiceApi = async (authFetch, serviceId, formData) => {
  const res  = await authFetch(`${BASE}/services/${serviceId}`, { method: 'PATCH', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update service');
  return data;
};

export const deleteServiceApi = async (authFetch, serviceId) => {
  const res  = await authFetch(`${BASE}/services/${serviceId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete service');
  return data;
};
