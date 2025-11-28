import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoImage from "../assets/logo-MR.png";

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const linkClasses = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group mb-1 ${
      isActive(path)
        ? "bg-purple-600/10 text-purple-300 font-semibold border border-purple-500/20"
        : "text-slate-400 hover:bg-white/5 hover:text-white font-medium"
    }`;

  return (
    <>
      {/* OVERLAY para móvil */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-[#0f1720]
          border-r border-white/10 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-72 md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8 flex-shrink-0">
          <img src={logoImage} alt="MindRaven" className="h-8" />
          <span className="text-white font-bold text-xl">MindRaven</span>

          {/* Botón cerrar móvil */}
          <button
            className="md:hidden text-white ml-auto"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">

          <Link
            to="/projects/select"
            className={linkClasses("/projects/select")}
            onClick={() => setOpen(false)}
          >
            🚀 <span>Crear proyecto</span>
          </Link>

          <Link
            to="/projects"
            className={linkClasses("/projects")}
            onClick={() => setOpen(false)}
          >
            📚 <span>Proyectos</span>
          </Link>

        </nav>

        {/* USER CARD */}
        <div className="p-4 border-t border-white/5 bg-[#0B0F19]/50">
          {user ? (
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{user?.name}</div>
                  <div className="text-[10px] text-purple-300">Explorador</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-400"
              >
                ⎋
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn-primary">Iniciar sesión</Link>
              <Link to="/register" className="border border-white/20 text-slate-300 hover:bg-white/5 px-4 py-2 rounded-lg">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
