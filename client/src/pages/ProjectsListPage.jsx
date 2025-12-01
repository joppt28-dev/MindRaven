import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/apiRequest';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

const ProjectsListPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, project: null, isDeleting: false });

  // 1. Cargar proyectos al entrar
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await apiRequest('/api/projects', token);
        setProjects(data || []);
      } catch (err) {
        console.error("Error cargando historial:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadProjects();
  }, [token]);

  // 2. Función para abrir un proyecto
  const handleOpenProject = (project) => {
    // Navega al flujo pasando el proyecto completo via 'state'
    navigate('/projects/flow', { 
      state: { 
        project: project,
        isNew: false 
      } 
    });
  };

  // 3. Función para abrir modal de eliminación
  const handleOpenDeleteModal = (project, e) => {
    e.stopPropagation(); // Evita que se abra el proyecto al hacer clic
    setDeleteModal({ isOpen: true, project, isDeleting: false });
  };

  // 4. Función para cerrar modal
  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, project: null, isDeleting: false });
  };

  // 5. Función para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deleteModal.project?.id) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      await apiRequest(`/api/projects/${deleteModal.project.id}`, token, {
        method: 'DELETE',
      });

      // Rastrear eliminación de proyecto
      trackEvent('project_deleted', {
        project_id: deleteModal.project.id,
        idea_title: deleteModal.project.idea_data?.ideaTitle,
      });

      // Actualizar la lista de proyectos
      setProjects(prev => prev.filter(p => p.id !== deleteModal.project.id));
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Error eliminando proyecto:", err);
      alert('Error al eliminar el proyecto. Intenta de nuevo.');
    } finally {
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="min-h-screen px-4 pt-4 pb-10 sm:px-10 md:px-16 animate-fade-in-up">
      
      {/* Encabezado */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold mb-2">Tu Portafolio</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Mis Proyectos</h1>
        </div>
        <button
          onClick={() => navigate('/ideas')}
          className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-purple-500/50 transition-all flex items-center gap-2"
        >
          <span>✨</span> Nuevo Proyecto
        </button>
      </header>

      {/* Estados de Carga */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-[2rem] bg-[#131620] border border-white/5 animate-pulse"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        // Estado Vacío
        <div className="text-center py-24 bg-[#131620] rounded-[2.5rem] border border-white/5 shadow-inner">
          <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 text-5xl">
            📂
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Tu espacio está vacío</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Aún no has guardado ningún proyecto. Ve al generador para comenzar tu primera innovación.
          </p>
          <button 
            onClick={() => navigate('/ideas')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:scale-105 transition shadow-lg shadow-purple-900/20"
          >
            Generar mi primer proyecto
          </button>
        </div>
      ) : (
        // Grid de Proyectos
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => (
            <div 
              key={proj.id}
              onClick={() => handleOpenProject(proj)}
              className="group relative bg-[#131620] border border-white/10 p-7 rounded-[2rem] hover:border-purple-500/50 hover:bg-[#161a25] cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 flex flex-col h-full"
            >
              {/* Botón Eliminar (Esquina Superior Derecha) */}
              <button
                onClick={(e) => handleOpenDeleteModal(proj, e)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition opacity-0 group-hover:opacity-100 z-10"
                title="Eliminar proyecto"
              >
                ✕
              </button>

              {/* Etiqueta de Fecha */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                  🚀
                </div>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                  {new Date(proj.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Contenido */}
              <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">
                {proj.idea_data.ideaTitle || 'Proyecto sin título'}
              </h3>
              
              <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed mb-6 flex-1">
                {proj.idea_data.ideaSummary}
              </p>

              {/* Footer de la tarjeta */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Tema origen</span>
                  <span className="text-xs text-slate-300 truncate max-w-[150px]">
                    {proj.prompt}
                  </span>
                </div>
                <span className="text-purple-400 text-sm font-bold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseDeleteModal}
          ></div>
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-red-500/30 bg-[#0b0f19] shadow-2xl p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">¿Eliminar proyecto?</h3>
              <p className="text-slate-400">
                Se eliminará permanentemente el proyecto <span className="font-semibold text-white">"{deleteModal.project?.idea_data?.ideaTitle}"</span>. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseDeleteModal}
                disabled={deleteModal.isDeleting}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteModal.isDeleting}
                className="flex-1 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 hover:border-red-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteModal.isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></span>
                    Eliminando...
                  </>
                ) : (
                  <>🗑️ Eliminar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsListPage;