import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as transactionService from "@/shared/api/services/transactionService";
import { useActiveChild } from "@/shared/lib/activeChild";

const MOCK_TRIAL = {
  totalDays: 7,
  usedDays: 5,
};

function StatusBadge({ status }: { status: transactionService.Transaction["status"] }) {
  const isOk = status === "Thành công";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
        isOk ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full inline-block ${
          isOk ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {status}
    </span>
  );
}

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

export function BillingManagement() {
  const navigate = useNavigate();
  const [upgrading] = useState(false);
  const { activeChild, dashboardData } = useActiveChild();
  const plan = activeChild.plan;
  const billing = dashboardData.billing;
  const remaining = MOCK_TRIAL.totalDays - MOCK_TRIAL.usedDays;
  const progressPct = (MOCK_TRIAL.usedDays / MOCK_TRIAL.totalDays) * 100;
  const [transactions, setTransactions] = useState<transactionService.Transaction[]>([]);
  
  useEffect(() => {
    // Parent ID shouldn't be hardcoded ideally, using a fallback for now.
    // Replace "parent-1" with actual parent ID from auth later if available.
    transactionService.getAll("parent-1").then(setTransactions).catch(console.error);
  }, []);

  const priceLabel =
    plan === "VIP"
      ? `${formatVnd(billing.pricePerMonth)}/tháng`
      : plan === "PRO"
        ? `${formatVnd(billing.pricePerMonth)}/tháng`
        : "Miễn phí";

  function handleUpgrade() {
    navigate("/dashboard/payment?plan=PRO");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Section 1: Current plan ── */}
      <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-sm p-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
              Gói hiện tại
            </p>
            <h2 className="text-xl font-bold text-gray-800">Học thử 7 ngày</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Miễn phí · Trải nghiệm đầy đủ tính năng
            </p>
          </div>

          {/* Badge */}
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 shrink-0">
            Đang dùng thử
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Tiến trình học thử</span>
            <span className="font-semibold text-blue-600">
              Còn {remaining} ngày
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Đã dùng {MOCK_TRIAL.usedDays}/{MOCK_TRIAL.totalDays} ngày học thử
          </p>
        </div>

        {/* Upgrade button */}
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="mt-5 w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 disabled:opacity-70 text-white font-bold text-sm rounded-xl px-6 py-3.5 shadow-md shadow-orange-200 transition-all duration-200 active:scale-[0.98]"
        >
          {upgrading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xử lý…
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 3l14 9-14 9V3z"
                />
              </svg>
              Nâng cấp lên ViOlympicKids Pro ({priceLabel})
            </>
          )}
        </button>

        {/* Pro features hint */}
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
          {[
            "200+ bài học 3D",
            "AI Hướng dẫn giọng nói",
            "Báo cáo chi tiết hàng ngày",
            "Không giới hạn bài tập",
            "Hỗ trợ ưu tiên 24/7",
            "Nội dung mới mỗi tuần",
          ].map((f) => (
            <li key={f} className="flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Section 2: Payment history ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Lịch sử thanh toán
        </h3>

        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "Mã giao dịch",
                  "Ngày thanh toán",
                  "Số tiền",
                  "Trạng thái",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr
                  key={tx.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                    i === transactions.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-6 py-3 font-mono text-xs text-gray-600">
                    {tx.id}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{tx.date}</td>
                  <td className="px-6 py-3 font-semibold text-gray-800">
                    {formatVnd(tx.amount)}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Chưa có giao dịch nào.
          </p>
        )}
      </div>
    </div>
  );
}
