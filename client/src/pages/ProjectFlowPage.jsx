import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/apiRequest';

const ArticleCard = ({ article }) => (
  <article className="glass-panel rounded-2xl p-5 space-y-2 bg-[#131620] border border-white/5">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{article.source}</p>
        <h4 className="font-semibold text-lg text-white">{article.title}</h4>
      </div>
      <span className="text-sm text-slate-500">{article.year || 's/f'}</span>
    </div>
    <p className="text-sm text-slate-400">{article.abstract}</p>
    <p className="text-xs text-purple-400 mt-2">{article.supportRationale}</p>
    {article.url && (
      <a
        className="inline-flex text-sm font-semibold text-slate-400 hover:text-white transition-colors mt-2"
        href={article.url}
        target="_blank"
        rel="noreferrer"
      >
        Ver artículo ↗
      </a>
    )}
  </article>
);

const ProjectFlowPage = () => {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- LÓGICA DE RECUPERACIÓN DE DATOS ---
  const state = location.state || {};
  
  // 1. Intentamos leer el proyecto completo (desde BD)
  const projectDB = state.project;
  
  // 2. Si no hay proyecto BD, buscamos el presetIdea (flujo antiguo)
  // Normalizamos para tener siempre 'ideaData' y 'prompt'
  const ideaData = projectDB?.idea_data || state.presetIdea;
  const promptText = projectDB?.prompt || ideaData?.ideaTitle || '';

  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runBootstrap = async () => {
    if (!ideaData) return;

    setLoading(true);
    setError('');
    
    try {
      // Llamamos al bootstrap para generar el contenido extendido (Define, Locate, Prepare, Confirm)
      // Usamos la info que ya tenemos (ideaData) para no gastar tokens generando la idea base de nuevo
      const data = await apiRequest('/api/projects/bootstrap', token, {
        method: 'POST',
        body: JSON.stringify({
          topic: promptText,
          ideaInput: { 
            idea: ideaData, // Pasamos la idea ya existente
            mode: 'preset' 
          },
          projectType: 'innovation' // Por defecto
        }),
      });
      
      setFlow(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al cargar los detalles del proyecto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si tenemos token y datos de la idea, pero no el flujo calculado, ejecutamos.
    if (token && ideaData && !flow) {
      runBootstrap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // --- GUARDIANES ---
  if (!token) return <Navigate to="/login" replace />;
  
  // Si no hay ni proyecto BD ni idea preset, no deberíamos estar aquí -> volver.
  if (!ideaData) {
    return <Navigate to="/ideas" replace />;
  }

  return (
    <div className="min-h-screen px-4 pt-4 pb-10 sm:px-10 md:px-16 animate-fade-in-up">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold">
                {projectDB ? 'Proyecto Guardado' : 'Borrador'}
              </span>
              {projectDB && (
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-500 border border-white/5">
                  {new Date(projectDB.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {ideaData.ideaTitle}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Flujo de trabajo activo: Define → Localiza → Prepara → Confirma
            </p>
          </div>
          
          <button
            type="button"
            className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
            onClick={() => navigate('/projects')} // Volver a la lista
          >
            ← Volver a Mis Proyectos
          </button>
        </header>

        {/* Estado de Carga */}
        {loading && (
          <div className="py-20 text-center space-y-6">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 animate-pulse">Recuperando inteligencia del proyecto...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-center">
            {error}
            <button onClick={runBootstrap} className="block mx-auto mt-2 text-sm underline">Reintentar</button>
          </div>
        )}

        {/* CONTENIDO DEL FLUJO (Solo si ya cargó) */}
        {flow && !loading && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* PASO 1: DEFINE */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-[#131620] border border-white/10 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none"></div>
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.3em] text-purple-400 font-bold mb-4">Paso 1 · Estrategia</p>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold text-white">{flow.define.idea.ideaTitle}</h2>
                    <p className="text-slate-300 leading-relaxed text-lg">{flow.define.idea.ideaSummary}</p>
                  </div>
                  <div className="space-y-4 bg-black/20 p-6 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Innovación</p>
                      <p className="text-sm text-white">{flow.define.idea.innovationAngle}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Target</p>
                      <p className="text-sm text-white">{flow.define.idea.targetPersona}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PASO 2: LOCATE (Evidencia) */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold mb-1">Paso 2 · Evidencia</p>
                  <h3 className="text-xl font-bold text-white">Respaldo Científico</h3>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {flow.locate.articles?.map((article) => (
                  <ArticleCard key={article.id || article.title} article={article} />
                ))}
              </div>
            </section>

            {/* PASO 3: PREPARE (Canvas) */}
            <section className="bg-[#131620] border border-white/10 rounded-[2.5rem] p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-400 font-bold mb-6">Paso 3 · Estructura</p>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Columna Izquierda */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Problema & Insight
                    </h4>
                    <p className="text-sm text-slate-400 mb-2">{flow.prepare.problema}</p>
                    <p className="text-sm text-slate-300 italic">"{flow.prepare.insightUsuario}"</p>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Solución
                    </h4>
                    <p className="text-sm text-slate-400">{flow.prepare.propuestaValor}</p>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Oportunidades
                    </h4>
                    <ul className="space-y-2">
                      {flow.prepare.oportunidades?.map(op => (
                        <li key={op} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-yellow-500/50 mt-1">›</span> {op}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Validación Inicial
                    </h4>
                    <ul className="space-y-2">
                      {flow.prepare.validacionInicial?.map(val => (
                        <li key={val} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-blue-500/50 mt-1">›</span> {val}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* PASO 4: CONFIRM (Scoring) */}
            <section className="bg-gradient-to-br from-[#131620] to-[#0f1115] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                
                {/* Score Circle */}
                <div className="flex flex-col items-center justify-center w-40 h-40 rounded-full bg-[#0B0F19] border-4 border-green-500/20 shadow-2xl shrink-0">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-600">
                    {flow.confirm.totalScore}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">de 50</span>
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-green-400 font-bold mb-1">Veredicto IA</p>
                    <h3 className="text-2xl font-bold text-white">{flow.confirm.totalLabel}</h3>
                  </div>
                  
                  {/* Rubric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {flow.confirm.rubric?.map(r => (
                      <div key={r.id} className="bg-white/5 rounded-lg p-3 border border-white/5 text-left">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold truncate">{r.label}</span>
                          <span className="text-xs font-bold text-white">{r.score}</span>
                        </div>
                        <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${r.score * 10}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectFlowPage;