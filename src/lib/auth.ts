/**
 * Authentication service for Quinio Staff Calendar
 *
 * Handles:
 * - Login via Python backend API
 * - JWT token storage and retrieval
 * - Token verification
 * - Logout
 */

import { API_BASE_URL, AUTH_TOKEN_KEY, AUTH_PRACTICE } from './constants';

interface LoginResponse {
  success: boolean;
  token?: string;
  expires_at?: string;
  practice?: string;
  message?: string;
}

interface VerifyResponse {
  valid: boolean;
  practice?: string;
  message?: string;
}

/**
 * Login with password
 */
export async function login(password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        practice: AUTH_PRACTICE,
        password
      }),
    });

    const data = await response.json();

    if (data.success && data.token) {
      // Store token
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Unable to connect to server'
    };
  }
}

/**
 * Verify if the stored token is still valid
 */
export async function verifyToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data: VerifyResponse = await response.json();

    if (!data.valid) {
      // Token invalid - clear it
      logout();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Get the stored JWT token
 */
export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Check if user is authenticated (has token)
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Logout - clear token
 */
export function logout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}
