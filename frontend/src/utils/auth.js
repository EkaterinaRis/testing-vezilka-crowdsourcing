import { jwtDecode } from "jwt-decode";
import { normalizeUrls } from "./normalizeUrls";

export const saveAuth = (authResponse) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  // const avatarUrl = (authResponse.avatarUrl) ? `${BACKEND_URL}/${authResponse.avatarUrl}` : null;
  const avatarUrl = normalizeUrls(authResponse.avatarUrl);
  localStorage.setItem('token', authResponse.jwtToken);
  localStorage.setItem('user', JSON.stringify({
    firstName: authResponse.firstName,
    lastName: authResponse.lastName,
    email: authResponse.email,
    avatarUrl: avatarUrl,
    createdAt: authResponse.createdAt
  }));
};

export const refreshUserObj = async () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = getToken();

  const res = await fetch(`${BACKEND_URL}/api/auth`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to refresh user");
  }

  const data = await res.json();

  saveAuth(data);
  return data;
}

export const userCanReview = async () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = getToken();

  const res = await fetch(`${BACKEND_URL}/api/auth`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to refresh user");
  }

  const data = await res.json();

  return data.userCanReview;
}

export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem("token", token);

export const getUser = () => {
  const user = localStorage.getItem('user');
  if(!user) return null;

  const result = JSON.parse(user);
  result.createdAt = new Date(result.createdAt);
  return result;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isLoggedIn = () => {
  const token = getToken();

  return !!token && !isTokenExpired();
}

export function isTokenExpired() {
  try {
    const token = getToken();

    if (!token) return true;

    const decoded = jwtDecode(token);

    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
}


export async function userIsAdmin() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = getToken();

  const res = await fetch(`${BACKEND_URL}/api/user/details`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return data.role == 'ADMIN';
}