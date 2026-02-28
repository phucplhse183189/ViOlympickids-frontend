import { Outlet } from "react-router-dom";
import { KidsTopbar } from "@/widgets/kids-topbar";

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-sky-100 font-kids overflow-x-hidden">
      <KidsTopbar />
      {/* push content below fixed topbar */}
      <div className="pt-20">
        <Outlet />
      </div>
    </div>
  );
}
