import { apiGet, apiPost } from "@/shared/api/client";

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

/** Kết quả tạo payment PayOS */
export interface CreatePaymentResult {
  checkoutUrl: string;
  orderCode: number;
}

/** Kết quả check order PayOS */
export interface CheckOrderResult {
  status: "PENDING" | "PAID" | "CANCELLED";
  plan: string;
  cycle: string;
  amount: number;
  childName: string;
  childEmoji: string;
  createdAt: string;
  paidAt: string | null;
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

/**
 * Tạo link thanh toán PayOS
 */
export async function createPayment(data: {
  childId: string;
  parentId: string;
  plan: "PRO" | "VIP";
  cycle: "month" | "year";
  amount: number;
}): Promise<CreatePaymentResult> {
  return apiPost<CreatePaymentResult>("/payos/create-payment", data);
}

/**
 * Kiểm tra trạng thái đơn hàng PayOS
 */
export async function checkOrder(orderCode: number): Promise<CheckOrderResult> {
  return apiGet<CheckOrderResult>(`/payos/check-order?orderCode=${orderCode}`, { ttlMs: 0 });
}
