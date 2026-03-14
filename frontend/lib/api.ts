// API utility - calls backend server

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
}

async function request(method: string, url: string, data?: unknown): Promise<any> {
  const base = getApiUrl();
  const res = await fetch(`${base}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const json = await res.json();
  return { data: json };
}

export const api = {
  get: (url: string) => request('GET', url),
  post: (url: string, data?: unknown) => request('POST', url, data),
  put: (url: string, data?: unknown) => request('PUT', url, data),
  delete: (url: string) => request('DELETE', url),
};

