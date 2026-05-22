import { apiGet, apiPost } from "../client";

/** Giao dịch */
export interface Transaction {
  id: string;
  parentId: string;
  childId: string | null;
  date: string;
  amount: number;
  method: string;
  status: "Thành công" | "Thất bại";
}

/** Dữ liệu tạo giao dịch mới */
export interface CreateTransactionData {
  parentId: string;
  childId?: string;
  date: string;
  amount: number;
  method: string;
  status?: "Thành công" | "Thất bại";
}

/**
 * Lấy lịch sử giao dịch của phụ huynh
 */
export async function getAll(parentId: string): Promise<Transaction[]> {
  return apiGet<Transaction[]>(`/transactions?parentId=${parentId}`);
}

/**
 * Tạo giao dịch mới
 */
export async function create(tx: CreateTransactionData): Promise<Transaction> {
  return apiPost<Transaction>("/transactions", tx);
}
