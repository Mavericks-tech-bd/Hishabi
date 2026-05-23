import { createClient } from "@/utils/supabase/client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8003";

export function apiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE_URL}${cleanPath}`;
}

export async function safeJson(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function getApiErrorMessage(result: unknown, fallbackMessage: string) {
  if (!result || typeof result !== "object") {
    return fallbackMessage;
  }

  if ("detail" in result && typeof result.detail === "string") {
    return result.detail;
  }

  if ("message" in result && typeof result.message === "string") {
    return result.message;
  }

  if (
    "detail" in result &&
    result.detail &&
    typeof result.detail === "object" &&
    "message" in result.detail &&
    typeof result.detail.message === "string"
  ) {
    return result.detail.message;
  }

  if (
    "detail" in result &&
    result.detail &&
    typeof result.detail === "object" &&
    "upgrade_message" in result.detail &&
    typeof result.detail.upgrade_message === "string"
  ) {
    return result.detail.upgrade_message;
  }

  if (
    "detail" in result &&
    Array.isArray(result.detail) &&
    result.detail.length > 0
  ) {
    const firstError = result.detail[0];

    const fieldName = Array.isArray(firstError?.loc)
      ? firstError.loc.filter((item: string) => item !== "body").join(".")
      : "field";

    return `${fieldName}: ${firstError?.msg || fallbackMessage}`;
  }

  if (
    "field_errors" in result &&
    Array.isArray(result.field_errors) &&
    result.field_errors.length > 0
  ) {
    const firstError = result.field_errors[0];

    if (
      firstError &&
      typeof firstError === "object" &&
      "field" in firstError &&
      "message" in firstError
    ) {
      return `${firstError.field}: ${firstError.message}`;
    }
  }

  return fallbackMessage;
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
  fallbackErrorMessage = "Request failed"
): Promise<T> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = new Headers(options?.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const finalOptions = {
    ...options,
    headers
  };

  const response = await fetch(apiUrl(path), finalOptions);
  const result = await safeJson(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result, fallbackErrorMessage));
  }

  return result as T;
}
