import { nanoid } from 'nanoid';
export const generateAssociateId = () => 'ASC-' + nanoid(6).toUpperCase();
