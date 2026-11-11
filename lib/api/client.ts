const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('optifiber_token');
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('optifiber_token', token);
    document.cookie = `optifiber_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  } else {
    localStorage.removeItem('optifiber_token');
    document.cookie = 'optifiber_token=; path=/; max-age=0; SameSite=Lax';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      setStoredToken(null);
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/login';
      }
    }

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      let message = `HTTP error ${response.status}`;
      if (
        typeof errorData === 'object' &&
        errorData !== null &&
        'mo' in errorData &&
        typeof (errorData as { mo: unknown }).mo === 'object' &&
        Array.isArray((errorData as { mo: { listMessage?: string[] } }).mo?.listMessage) &&
        ((errorData as { mo: { listMessage: string[] } }).mo.listMessage.length > 0)
      ) {
        message = (errorData as { mo: { listMessage: string[] } }).mo.listMessage.join(' ');
      } else if (
        typeof errorData === 'object' &&
        errorData !== null &&
        'message' in errorData
      ) {
        message = String((errorData as { message: unknown }).message);
      }

      throw new ApiError(message, response.status, errorData);
    }

    const json = (await response.json()) as unknown;
    if (
      typeof json === 'object' &&
      json !== null &&
      'mo' in json &&
      'dto' in json
    ) {
      return (json as { dto: T }).dto;
    }

    return json as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : 'Error en la conexión con la API',
      0
    );
  }
}
