export async function apiFetch(url: string, init: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  
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

  return fetch(finalUrl, { ...init, headers });
}
