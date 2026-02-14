type ApiFetchOptions = RequestInit & { raw?: boolean };

export async function apiFetch<T = any>(url: string, init: ApiFetchOptions = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  let finalUrl = url;
  if (!finalUrl.startsWith("/api")) {
    if (!finalUrl.startsWith("/")) finalUrl = "/" + finalUrl;
    finalUrl = "/api" + finalUrl;
  }

  const headers = new Headers(init.headers);

  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(finalUrl, { ...init, headers });

  if (init.raw) return res as unknown as T;

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.message ||
      "Greška na serveru.";
    throw new Error(msg);
  }


  return (json?.data ?? json) as T;
}
