
import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-50">
      {/* ADMIN SIDEBAR */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN ADMIN CONTENT */}
      <div className="min-h-screen lg:pl-64">
        {/* ADMIN HEADER */}
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* ADMIN PAGES */}
        <main className="mx-auto w-full max-w-7xl p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
