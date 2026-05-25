import { nanoid } from 'nanoid';

export const generateAssociateId = () => 'ASC-' + nanoid(6).toUpperCase();

// Format: VYOM + 5 digits + PO  e.g. VYOM12345PO
let counter = Math.floor(10000 + Math.random() * 89999);
export const generateCandidateRefNo = () => {
  counter++;
  return `VYOM${String(counter).padStart(5, '0')}PO`;
};
