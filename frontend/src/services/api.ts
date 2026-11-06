export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(async () => ({ detail: await response.text().catch(() => response.statusText) }));
    const detail = payload?.detail;
    const message = typeof detail === 'string'
      ? detail
      : detail?.message ?? detail?.detail ?? JSON.stringify(detail ?? payload);
    const error = new Error(message || `${response.status} ${response.statusText}`);
    Object.assign(error, { status: response.status, retryable: Boolean(detail?.retryable) });
    throw error;
  }
  return response.json() as Promise<T>;
}

export const health = () => fetch(`${API}/api/health`).then(r => r.ok).catch(() => false);
