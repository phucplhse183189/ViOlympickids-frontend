/**
 * HTTP client wrapper cho frontend
 * Tự động gắn auth token từ sessionStorage vào header
 */

const BASE_URL = "/api";

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
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store", // Ngăn browser cache API
  });
  return handleResponse<T>(response);
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
  return handleResponse<T>(response);
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
  return handleResponse<T>(response);
}
