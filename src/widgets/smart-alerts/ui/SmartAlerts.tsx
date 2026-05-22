import { useState } from "react";
import { Link } from "react-router-dom";
import { type SmartAlert } from "@/shared/types/dashboard";
import { useActiveChild } from "@/shared/lib/activeChild";

// ── Icons ──────────────────────────────────────────────────────

function TrophyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5 text-yellow-500"
    >
      <path d="M11 2H7a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v1c0 2.55 1.83 4.67 4.26 5.14A6.01 6.01 0 0 0 11 15.91V18H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.09a6.01 6.01 0 0 0 4.74-3.77C20.17 11.67 22 9.55 22 7V6a2 2 0 0 0-2-2h-2V3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v.01L11 4V3a1 1 0 0 0 0-1zm1 2h2v9a4 4 0 0 1-8 0V4h6zM4 8V7h2v3.8A3.45 3.45 0 0 1 4 8zm14 2.8V7h2v1a3.45 3.45 0 0 1-2 2.8z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5 text-yellow-500"
    >
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

function AlertIcon({ type }: { type: SmartAlert["type"] }) {
  if (type === "success") return <TrophyIcon />;
  return <WarningIcon />;
}

function alertStyle(type: SmartAlert["type"]) {
  if (type === "success")
    return {
      border: "border-green-100",
      bg: "bg-green-50/60",
      iconBg: "bg-green-100",
    };
  return {
    border: "border-yellow-100",
    bg: "bg-yellow-50/50",
    iconBg: "bg-yellow-100",
  };
}

// ── Alert card ──────────────────────────────────────────────────

function AlertCard({
  alert,
  onDismiss,
}: {
  alert: SmartAlert;
  onDismiss: (id: string) => void;
}) {
  const style = alertStyle(alert.type);

  return (
    <div
      className={`flex gap-3 rounded-xl border ${style.border} ${style.bg} p-3.5 transition-all duration-300`}
    >
      {/* Icon */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center mt-0.5`}
      >
        <AlertIcon type={alert.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold text-gray-700">{alert.title}</p>
          <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">
            {alert.time}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
          {alert.message}
        </p>

        {/* Action + dismiss row */}
        <div className="flex items-center gap-3 mt-2">
          {alert.actionLabel && alert.actionLink && (
            <Link
              to={alert.actionLink}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
            >
              {alert.actionLabel} →
            </Link>
          )}
          <button
            onClick={() => onDismiss(alert.id)}
            className="ml-auto text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────

export function SmartAlerts() {
  const { dashboardData } = useActiveChild();
  const [alerts, setAlerts] = useState(dashboardData.alerts);

  function dismiss(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Cảnh báo thông minh
        </h3>
        {alerts.length > 0 && (
          <span className="text-xs bg-orange-50 text-orange-500 font-semibold px-2 py-0.5 rounded-full border border-orange-100">
            {alerts.length} mới
          </span>
        )}
      </div>

      {/* Alert list */}
      {alerts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onDismiss={dismiss} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="text-3xl">🎉</span>
          <p className="text-sm font-medium text-gray-600">
            Tất cả đều ổn định!
          </p>
          <p className="text-xs text-gray-400">
            Không có cảnh báo nào mới hôm nay.
          </p>
        </div>
      )}
    </div>
  );
}
