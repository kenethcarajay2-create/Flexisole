
import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeader({ onMenuClick }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b border-brand-200 bg-white/95 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-brand-900 hover:bg-brand-100 lg:hidden"
        >
          <Menu size={23} />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck size={21} className="text-brand-600" />
          <span className="text-sm font-semibold text-brand-900 sm:text-base">
            Store Administration
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-brand-900">
            {admin?.name || "Administrator"}
          </p>
          <p className="text-xs text-brand-600">
            Admin
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-brand-200 px-3 py-2 text-xs font-semibold text-brand-900 hover:bg-brand-50 sm:px-4 sm:text-sm"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </header>
  );
}
