/**
 * Authentication service for Quinio Staff Calendar
 *
 * Handles:
 * - Login via Python backend API
 * - JWT token storage and retrieval
 * - Token verification
 * - Logout
 * - Staff name tracking
 */

import { API_BASE_URL, AUTH_TOKEN_KEY, STAFF_NAME_KEY, AUTH_PRACTICE } from './constants';

interface LoginResponse {
  success: boolean;
  token?: string;
  expires_at?: string;
  practice?: string;
  staff_name?: string;
  message?: string;
}

interface VerifyResponse {
  valid: boolean;
  practice?: string;
  staff_name?: string;
  message?: string;
}

/**
 * Login with password and staff name
 */
export async function login(password: string, staffName?: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        practice: AUTH_PRACTICE,
        password,
        staff_name: staffName
      }),
    });

    const data = await response.json();

    if (data.success && data.token) {
      // Store token
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      
      // Store staff name for display purposes
      if (data.staff_name) {
        localStorage.setItem(STAFF_NAME_KEY, data.staff_name);
      }
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

    // Update staff name if returned from token
    if (data.staff_name) {
      localStorage.setItem(STAFF_NAME_KEY, data.staff_name);
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
 * Get the current staff member's name
 */
export function getStaffName(): string | null {
  return localStorage.getItem(STAFF_NAME_KEY);
}

/**
 * Check if user is authenticated (has token)
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Logout - clear token and staff name
 */
export function logout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(STAFF_NAME_KEY);
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
