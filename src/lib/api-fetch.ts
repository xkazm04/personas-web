type ApiFetchInit = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiFetch<T>(url: string, init: ApiFetchInit = {}): Promise<T> {
  const { method = "GET", body, signal } = init;
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
  if (!res.ok) {
    throw new Error(`${method} ${url} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
