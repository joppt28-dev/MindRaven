import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo-MR.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });   
  };

  const isActive = (path) => location.pathname === path;

  const linkClasses = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group mb-1 ${
      isActive(path)
        ? 'bg-cyan-600/10 text-cyan-300 font-semibold border border-cyan-500/20'
        : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
    }`;

  return (
    <aside className="fixed left-0 top-0 z-50 w-72 h-screen bg-[#0f1720] border-r border-white/10 flex flex-col">
      
      {/* 1. Logo (Con padding para que respire) */}
      <div className="flex items-center gap-3 px-6 py-8 flex-shrink-0">
        <img src={logoImage} alt="MindRaven" className="h-8 w-auto drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
        <span className="text-white font-bold text-xl tracking-wide">MindRaven</span>
      </div>

      {/* 2. Navegación (Con scroll si la pantalla es muy chica) */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <Link to="/" className={linkClasses('/')}>
          <span className={`text-xl transition-opacity ${isActive('/') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>🏠</span>
          <span>Inicio</span>
        </Link>
        <Link to="/projects/select" className={linkClasses('/projects/select')}>
          <span className={`text-xl transition-opacity ${isActive('/projects/select') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>🚀</span>
          <span>Crear proyecto</span>
        </Link>
        <Link to="/ideas" className={linkClasses('/ideas')}>
          <span className={`text-xl transition-opacity ${isActive('/ideas') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>✨</span>
          <span>Generador</span>
        </Link>
        <Link to="/projects" className={linkClasses('/projects')}>
          <span className={`text-xl transition-opacity ${isActive('/projects') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>📚</span>
          <span>Proyectos</span>
        </Link>
      </nav>

      {/* 3. Usuario / Auth (Pegado abajo pero con estilo premium) */}
      <div className="p-4 border-t border-white/5 bg-[#0B0F19]/50">
        {user ? (
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/5 transition-colors hover:border-white/10 hover:bg-white/10 group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-[#0f1720]">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white text-sm truncate">{user?.name}</div>
                <div className="text-[10px] text-cyan-300 truncate uppercase tracking-wider font-medium">Explorador</div>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all"
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.56 0L3 11.25l1.22 2.78a.75.75 0 1 0 1.56-.69L5.25 12h6a.75.75 0 0 0 0-1.5h-6l.53-1.34a.75.75 0 0 0 0-.69Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Link to="/login" className="w-full text-center px-4 py-2.5 rounded-xl btn-primary font-semibold text-sm shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/40 transition-all">
              Iniciar sesión
            </Link>
            <Link to="/register" className="w-full text-center px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-semibold text-sm">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;