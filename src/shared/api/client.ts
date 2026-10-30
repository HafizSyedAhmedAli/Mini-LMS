export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(
  path: string,
  init: Omit<RequestInit, "body"> & { json?: unknown } = {},
): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(path, {
    ...rest,
    headers: { "content-type": "application/json", ...rest.headers },
    body: json === undefined ? undefined : JSON.stringify(json),
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401 && !path.startsWith("/api/auth/login")) window.location.href = "/login";
  if (!res.ok) throw new ApiError(res.status, data?.error ?? "Request failed");
  return data as T;
}
