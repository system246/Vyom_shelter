import { nanoid } from 'nanoid';
export const generateAssociateId    = () => 'ASC-'    + nanoid(6).toUpperCase();
export const generateCandidateRefNo = () => 'CREF-'   + nanoid(6).toUpperCase();
export const generatePropertyId     = () => 'VS-PROP-' + nanoid(7).toUpperCase();
export const generateEnquiryId      = () => 'VS-ENQ-'  + nanoid(7).toUpperCase();
