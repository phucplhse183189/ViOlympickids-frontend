/**
 * HTTP client wrapper cho frontend
 * Tự động gắn auth token từ sessionStorage vào header
 */

const BASE_URL = "/api";
const DEFAULT_GET_TTL_MS = 10_000;

interface ApiGetOptions {
  /** Thời gian giữ kết quả trong bộ nhớ. Đặt 0 cho dữ liệu cần realtime. */
  ttlMs?: number;
  /** Bỏ qua kết quả đã cache, nhưng vẫn gộp request trùng đang chạy. */
  force?: boolean;
}

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const getCache = new Map<string, CacheEntry>();
const inFlightGets = new Map<string, Promise<unknown>>();
let cacheVersion = 0;

function getRequestScope(): string {
  const parentId = sessionStorage.getItem("vio_parent_id");
  if (parentId) return `parent:${parentId}`;
  return sessionStorage.getItem("vio_admin_session") ? "admin" : "guest";
}

function getCacheKey(path: string): string {
  return `${getRequestScope()}:${path}`;
}

/** Xóa cache sau mọi mutation để lần đọc kế tiếp luôn nhận dữ liệu mới. */
export function invalidateApiCache(): void {
  cacheVersion += 1;
  getCache.clear();
  inFlightGets.clear();
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Lấy token/user từ sessionStorage nếu có
  const parentId = sessionStorage.getItem("vio_parent_id");
  if (parentId) {
    headers["x-user-id"] = parentId;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      (errorBody as { error?: string }).error ||
      `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

/**
 * GET request
 * @param path — đường dẫn API, VD: "/children?parentId=abc"
 */
export async function apiGet<T>(path: string, options: ApiGetOptions = {}): Promise<T> {
  const ttlMs = options.ttlMs ?? DEFAULT_GET_TTL_MS;
  const key = getCacheKey(path);
  const now = Date.now();

  if (!options.force && ttlMs > 0) {
    const cached = getCache.get(key);
    if (cached && cached.expiresAt > now) return cached.data as T;
    if (cached) getCache.delete(key);
  }

  const pending = inFlightGets.get(key);
  if (pending) return pending as Promise<T>;

  const requestVersion = cacheVersion;
  let request: Promise<T>;
  request = fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  })
    .then(handleResponse<T>)
    .then((data) => {
      if (ttlMs > 0 && requestVersion === cacheVersion) {
        getCache.set(key, { data, expiresAt: Date.now() + ttlMs });
      }
      return data;
    })
    .finally(() => {
      if (inFlightGets.get(key) === request) inFlightGets.delete(key);
    });

  inFlightGets.set(key, request);
  return request;
}

/**
 * POST request
 * @param path — đường dẫn API
 * @param body — dữ liệu gửi lên
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await handleResponse<T>(response);
  invalidateApiCache();
  return data;
}

/**
 * PUT request
 * @param path — đường dẫn API
 * @param body — dữ liệu cập nhật
 */
export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await handleResponse<T>(response);
  invalidateApiCache();
  return data;
}

/**
 * DELETE request
 * @param path — đường dẫn API
 */
export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<T>(response);
  invalidateApiCache();
  return data;
}
