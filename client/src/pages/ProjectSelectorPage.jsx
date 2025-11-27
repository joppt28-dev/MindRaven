import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProjectSelectorPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-10 md:px-16 animate-fade-in-up">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- ENCABEZADO --- */}
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold">Selecciona tu flujo</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Elige tu camino de creación
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            MindRaven te guiará paso a paso para estructurar tu idea y convertirla en una realidad validada.
          </p>
        </div>

        {/* --- TARJETA ÚNICA CENTRADA --- */}
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => navigate('/ideas')}
            className="group relative w-full max-w-md bg-[#131620] border border-white/10 rounded-3xl p-8 text-left hover:border-purple-500/50 hover:bg-[#1A1F2E] transition-all duration-300 shadow-2xl shadow-black/50 hover:shadow-purple-900/20 hover:-translate-y-1"
          >
            {/* Icono Flotante Decorativo */}
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🚀
            </div>

            <div className="space-y-5">
              {/* Icono Principal */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-3xl shadow-lg group-hover:shadow-purple-500/40 transition-shadow">
                💡
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  Proyecto de Innovación / Startup
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Genera propuestas originales, encuentra evidencia científica reciente y valida tu mercado con scoring automático en 4 pasos.
                </p>
              </div>

              {/* Call to Action Visual */}
              <div className="pt-4 flex items-center text-xs font-bold text-purple-400 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                Comenzar ahora →
              </div>
            </div>
          </button>
        </div>

        {/* --- FOOTER SUTIL --- */}
        <div className="text-center pt-8">
           <p className="text-xs text-slate-600">
             Más flujos de investigación llegarán en próximas actualizaciones.
           </p>
        </div>

      </div>
    </div>
  );
};

export default ProjectSelectorPage;