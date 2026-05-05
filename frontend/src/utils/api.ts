const BASE_URL = 'http://localhost:8000';

// Wrapper central pour tous les appels API : injecte le JWT et normalise les erreurs
// L'erreur enrichie avec `status` et `data` permet d'afficher les messages de validation de l'API
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message ?? `HTTP ${res.status}`), { status: res.status, data: err });
  }
  return res;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  return res.json();
}

// API Platform exige application/ld+json pour les POST
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/ld+json' },
  });
  return res.json();
}

// API Platform exige application/merge-patch+json pour les PATCH
export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/merge-patch+json' },
  });
  return res.json();
}
