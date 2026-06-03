import { reportError } from "./monitoring";

export type SafeFetchOptions = RequestInit & {
  /** Timeout per attempt in ms. Default 15000. */
  timeoutMs?: number;
  /** Max retry attempts (excluding initial). Default 2. */
  retries?: number;
  /** Base backoff in ms. Default 500. */
  backoffMs?: number;
};

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: unknown,
  ) {
    super(`HTTP ${status} ${statusText}`);
    this.name = "HttpError";
  }
}

/** Retry on network errors, 408, 429, and 5xx. */
function isRetryable(err: unknown, status?: number) {
  if (status === 408 || status === 429) return true;
  if (status && status >= 500 && status < 600) return true;
  if (err instanceof TypeError) return true; // network failure
  if (err instanceof DOMException && err.name === "AbortError") return true;
  return false;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * fetch() wrapper with timeout, exponential backoff retry, and typed errors.
 * Throws HttpError for non-2xx after retries; throws Error for network issues.
 */
export async function safeFetch(
  input: RequestInfo | URL,
  options: SafeFetchOptions = {},
): Promise<Response> {
  const {
    timeoutMs = 15000,
    retries = 2,
    backoffMs = 500,
    ...init
  } = options;

  let attempt = 0;
  let lastErr: unknown;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) {
        if (isRetryable(undefined, res.status) && attempt < retries) {
          attempt++;
          await sleep(backoffMs * 2 ** (attempt - 1));
          continue;
        }
        let body: unknown;
        try {
          body = await res.clone().json();
        } catch {
          try {
            body = await res.clone().text();
          } catch {}
        }
        throw new HttpError(res.status, res.statusText, body);
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (isRetryable(err) && attempt < retries) {
        attempt++;
        await sleep(backoffMs * 2 ** (attempt - 1));
        continue;
      }
      reportError(err, { url: String(input), attempt });
      throw err;
    }
  }
  throw lastErr ?? new Error("safeFetch: exhausted retries");
}

/** Convenience: safeFetch + JSON parse. */
export async function safeFetchJson<T = unknown>(
  input: RequestInfo | URL,
  options?: SafeFetchOptions,
): Promise<T> {
  const res = await safeFetch(input, options);
  return res.json() as Promise<T>;
}

/** Human-readable error for any thrown value. */
export function describeError(err: unknown): string {
  if (err instanceof HttpError) {
    switch (err.status) {
      case 400:
        return "Bad request. Please check your input.";
      case 401:
        return "You need to sign in to continue.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "We couldn't find what you were looking for.";
      case 408:
      case 429:
        return "The server is busy. Please try again in a moment.";
      default:
        if (err.status >= 500) return "Server error. Please try again shortly.";
        return err.message;
    }
  }
  if (err instanceof DOMException && err.name === "AbortError") {
    return "Request timed out. Check your connection and try again.";
  }
  if (err instanceof TypeError) {
    return "Network error. Please check your internet connection.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
