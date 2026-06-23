const BASE = '/api';

export const submitAssociate = async (formData, authFetch) => {
  const body = new FormData();
  const { documents, bank, ...rest } = formData;
  const { aadhaarFile, panFile, ...docData } = documents || {};
  const { bankDocument, ...bankData } = bank || {};

  body.append('personal',     JSON.stringify(rest.personal     || {}));
  body.append('professional', JSON.stringify(rest.professional || {}));
  body.append('documents',    JSON.stringify(docData));
  body.append('bank',         JSON.stringify(bankData));
  body.append('referral',     JSON.stringify(rest.referral     || {}));
  body.append('declaration',  JSON.stringify(rest.declaration  || {}));

  if (aadhaarFile   instanceof File) body.append('aadhaarFile',   aadhaarFile);
  if (panFile       instanceof File) body.append('panFile',       panFile);
  if (bankDocument  instanceof File) body.append('bankDocument',  bankDocument);

  const res  = await authFetch(`${BASE}/associates`, { method: 'POST', body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Submission failed');
  return data;
};

export const saveDraftApi = async () => ({ success: true });

export const fetchAssociates = async (authFetch, { status, page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  const res  = await authFetch(`${BASE}/associates?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const fetchAssociateById = async (authFetch, id) => {
  const res  = await authFetch(`${BASE}/associates/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
