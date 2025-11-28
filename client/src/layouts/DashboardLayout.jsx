import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex">

      {/* SIDEBAR RESPONSIVE */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* CONTENIDO */}
      <main
        className={`flex-1 min-h-screen p-6 transition-all duration-300
          ${sidebarOpen ? "md:ml-72" : "md:ml-72"}
        `}
      >
        {/* BOTÓN HAMBURGUESA SOLO PARA MÓVILES */}
        <button
          className="md:hidden text-white mb-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
