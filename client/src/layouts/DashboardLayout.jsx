import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex">
      {/* El Sidebar es fijo (fixed) y mide w-72 */}
      <Sidebar />

      {/* --- AQUÍ ESTÁ EL ARREGLO --- */}
      {/* 'ml-72': Empuja el contenido a la derecha exactamente el ancho del Sidebar */}
      {/* 'w-full': Asegura que ocupe el resto del ancho */}
      <main className="ml-72 w-full min-h-screen p-8 transition-all">
        
        {/* Aquí se renderizan tus páginas (Generador, Proyectos, etc.) */}
        <Outlet />
        
      </main>
    </div>
  );
};

export default DashboardLayout;