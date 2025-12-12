import { api, setToken } from './api';

export type LoginPayload = { email: string; password: string };

export type RegisterParticulierPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  postalAddress: string;
  isOver18: boolean;
  newsletter?: boolean;
  rgpdAccepted?: boolean;
};

export type RegisterProfessionnelPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  siret: string;
  postalAddress: string;
  officialDocument?: string;
  website?: string;
  specialities?: string[];
  mostSearchedItems?: string[];
  newsletter?: boolean;
  cgvAccepted?: boolean;
  mandateAccepted?: boolean;
};

export async function login(payload: LoginPayload) {
  const { data } = await api.post('/auth/login', payload);
  const token = data?.access_token || data?.accessToken;
  if (token) setToken(token);
  return data;
}

export async function registerParticulier(payload: RegisterParticulierPayload) {
  return api.post('/auth/register/particulier', payload);
}

export async function registerProfessionnel(payload: RegisterProfessionnelPayload) {
  return api.post('/auth/register/professionnel', payload);
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return data;
}

export function logout() {
  setToken(null);
}

