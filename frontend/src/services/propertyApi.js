const BASE = '/api';

// ---------- PUBLIC (no login) ----------

export const submitProperty = async (formData) => {
  const body = new FormData();
  const { images, video, documents, ...rest } = formData;

  body.append('listingType',     rest.listingType);
  body.append('propertyType',    rest.propertyType);
  body.append('title',           rest.title);
  body.append('description',     rest.description);
  body.append('location',        JSON.stringify(rest.location || {}));
  body.append('area',            JSON.stringify(rest.area || {}));
  body.append('frontRoadWidth',  rest.frontRoadWidth || '');
  body.append('facing',          rest.facing || '');
  body.append('price',           rest.price);
  body.append('negotiable',      rest.negotiable ? 'true' : 'false');
  body.append('seller',          JSON.stringify(rest.seller || {}));
  body.append('ownership',       JSON.stringify(rest.ownership || {}));
  body.append('facilities',      JSON.stringify(rest.facilities || []));
  body.append('nearbyLandmarks', JSON.stringify(rest.nearbyLandmarks || []));

  (images || []).forEach((file) => { if (file instanceof File) body.append('images', file); });
  if (video instanceof File) body.append('video', video);

  Object.entries(documents || {}).forEach(([key, file]) => {
    if (file instanceof File) body.append(key, file);
  });

  const res  = await fetch(`${BASE}/properties`, { method: 'POST', body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Submission failed');
  return data;
};

export const fetchProperties = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null))
  );
  const res  = await fetch(`${BASE}/properties?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load properties');
  return data;
};

export const fetchPropertyById = async (id) => {
  const res  = await fetch(`${BASE}/properties/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Property not found');
  return data;
};

export const submitEnquiry = async (propertyId, payload) => {
  const res  = await fetch(`${BASE}/properties/${propertyId}/enquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Enquiry failed');
  return data;
};

// ---------- ADMIN / ASSOCIATE (protected) ----------

export const fetchAdminProperties = async (authFetch, { status, page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  const res  = await authFetch(`${BASE}/properties/admin/all?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const updatePropertyStatus = async (authFetch, propertyId, payload) => {
  const res  = await authFetch(`${BASE}/properties/${propertyId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const fetchAdminEnquiries = async (authFetch, { status, page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  const res  = await authFetch(`${BASE}/properties/admin/enquiries?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const updateEnquiryStatus = async (authFetch, enquiryId, status) => {
  const res  = await authFetch(`${BASE}/properties/admin/enquiries/${enquiryId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
