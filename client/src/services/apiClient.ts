/**
 * Frontend transport boundary. Replace the base URL through VITE_API_BASE_URL
 * when the real backend is available; the visual page does not depend on it yet.
 */

import type { ApiErrorPayload } from "@/types/api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const body = (await response.json().catch(() => null)) as T | ApiErrorPayload | null;
  if (!response.ok) {
    const message = body && typeof body === "object" && "message" in body ? body.message : "The request could not be completed.";
    throw new Error(message);
  }

  return body as T;
}
