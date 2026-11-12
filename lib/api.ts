export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (init.method && !["GET", "HEAD"].includes(init.method)) {
    const csrf = await fetch("/api/v1/auth/csrf", {
      credentials: "include",
      cache: "no-store",
    });
    if (!csrf.ok)
      throw new ApiError(
        "Could not secure your request. Please try again.",
        csrf.status,
      );
    const token: { token: string; headerName: string } = await csrf.json();
    headers.set(token.headerName, token.token);
  }
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      body?.message ||
        (response.status === 401
          ? "Please sign in to continue."
          : "Something went wrong. Please try again."),
      response.status,
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}
