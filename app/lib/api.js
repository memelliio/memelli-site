export const RAIL =
  process.env.NEXT_PUBLIC_RAIL ||
  "https://memelli-bar-control.up.railway.app";

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("memelli_token") || "";
}
export function setToken(t) {
  if (typeof window !== "undefined") localStorage.setItem("memelli_token", t || "");
}
export function setCustomer(id) {
  if (typeof window !== "undefined") localStorage.setItem("memelli_customer", id || "");
}
export function getCustomer() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("memelli_customer") || "";
}
export function authHeaders() {
  const t = getToken();
  return t ? { Authorization: "Bearer " + t } : {};
}
export async function railGet(path) {
  const r = await fetch(RAIL + path, { headers: authHeaders(), credentials: "include" });
  return r.json();
}
export async function railPost(path, body) {
  const r = await fetch(RAIL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(body || {})
  });
  let data = {};
  try { data = await r.json(); } catch (e) {}
  return { status: r.status, data };
}
