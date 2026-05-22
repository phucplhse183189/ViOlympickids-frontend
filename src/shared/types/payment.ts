/**
 * ============================================================
 *  Types – Thanh toán & Giao dịch
 *  Các kiểu dữ liệu thanh toán, gói cước, lịch sử giao dịch.
 * ============================================================
 */

// ── Thông tin thanh toán / gói cước ──────────────────────────

export interface BillingInfo {
  planName: string;
  pricePerMonth: number;
  renewalDate: string;
  paymentMethod: string;
  cycle: string;
  isActive: boolean;
}

// ── Giao dịch thanh toán ─────────────────────────────────────

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: "Thành công" | "Thất bại";
}
