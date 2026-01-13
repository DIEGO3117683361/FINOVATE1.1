import { UserProfile } from '../types';

const USER_KEY = 'finovate_user_profile';
const SESSION_KEY = 'finovate_session_active';

export const getUserProfile = (): UserProfile | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
};

export const setSessionActive = (active: boolean) => {
  if (active) {
    localStorage.setItem(SESSION_KEY, 'true');
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const isSessionActive = (): boolean => {
  return localStorage.getItem(SESSION_KEY) === 'true';
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};