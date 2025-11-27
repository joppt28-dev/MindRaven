import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/apiRequest';

const sampleAreas = [
  'Emprendimiento social en Latinoamérica',
  'Innovación en IA aplicada a fintech',
  'Startups de tecnología climática para agro',
  'Tendencias GovTech y participación ciudadana',
];

const loadingSteps = [
  {
    title: 'Ideando con MindRaven',
    description: 'Sintetizando señales de innovación y retos regionales para proponer un concepto diferencial.',
  },
  {
    title: 'Analizando bases científicas',
    description: 'Consultando Semantic Scholar y CrossRef para encontrar artículos que respalden la hipótesis.',
  },
  {
    title: 'Evaluando la oportunidad',
    description: 'Aplicando la rúbrica de popularidad, prioridad e inevitabilidad para puntuar la idea.',
  },
];

const IdeaGeneratorPage = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [articles, setArticles] = useState([]); // Nota: no se usa en renderizado, pero se mantiene por estructura
  const [scores, setScores] = useState(null);
  const [loadingIdea, setLoadingIdea] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [progressIndex, setProgressIndex] = useState(0);
  const loadingRef = useRef(null);

  useEffect(() => {
    if (!loadingIdea) {
      setProgressIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setProgressIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 2200);
    if (loadingRef.current) {
      loadingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => clearInterval(interval);
  }, [loadingIdea]);

  const handleIdeaGeneration = async (event) => {
    event.preventDefault();
    if (!topic.trim()) {
      setError('Por favor escribe un área de interés.');
      return;
    }

    setLoadingIdea(true);
    setError('');
    setToast('');

    try {
      const data = await apiRequest('/api/ideas', token, {
        method: 'POST',
        body: JSON.stringify({ areaInteres: topic }),
      });

      let generated = data.ideas?.length ? data.ideas : [data.idea].filter(Boolean);

      // Deduplica por título.
      const seen = new Set();
      generated = generated.filter((idea) => {
        const key = (idea.ideaTitle || '').trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Si llegan menos de 3, crea variaciones diferenciadas.
      if (generated.length < 3 && generated[0]) {
        const base = generated[0];
        const variantSeeds = [
          {
            title: `${base.ideaTitle} · Enfoque B2B`,
            summary: `${base.ideaSummary} Priorizando adopción en empresas y canales comerciales.`,
          },
          {
            title: `${base.ideaTitle} · Enfoque consumidor`,
            summary: `${base.ideaSummary} Afinado para experiencia directa al usuario final y retención.`,
          },
          {
            title: `${base.ideaTitle} · Regulación/Impacto`,
            summary: `${base.ideaSummary} Incorporando cumplimiento normativo y métricas de impacto público.`,
          },
        ];

        for (const seed of variantSeeds) {
          const key = seed.title.toLowerCase();
          if (generated.length >= 3 || seen.has(key)) continue;
          generated.push({
            ...base,
            ideaTitle: seed.title,
            ideaSummary: seed.summary,
          });
          seen.add(key);
        }
      }

      setIdeas(generated.slice(0, 3));
      setArticles([]); 
      setScores(null);
      setToast('Ideas generadas.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingIdea(false);
    }
  };

  // --- NUEVA FUNCIÓN: GUARDAR Y NAVEGAR ---
  const handleSaveAndContinue = async (selectedIdea) => {
    try {
      // 1. Guardar en Supabase (POST /api/projects)
      const savedProject = await apiRequest('/api/projects', token, {
        method: 'POST',
        body: JSON.stringify({
          prompt: topic, // Guardamos lo que escribió el usuario
          ideaData: selectedIdea, // Guardamos el objeto de la idea completa
          status: 'active'
        }),
      });

      // 2. Navegar al Flujo pasando el proyecto guardado
      // IMPORTANTE: Cambié la ruta a '/projects/flow' para diferenciarla de la lista '/projects'
      navigate('/projects/flow', { 
        state: { 
          project: savedProject, // Este objeto tiene { id, user_id, prompt, idea_data... }
          isNew: true 
        } 
      });

    } catch (err) {
      console.error("Error guardando:", err);
      setError('No se pudo guardar el proyecto en el historial.');
    }
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen px-4 pt-4 pb-10 sm:px-10 md:px-16 relative">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5 relative overflow-hidden">
          {/* Lado Izquierdo */}
          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-900/20 border border-purple-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-300 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
              Motor de Inteligencia Activa
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-white tracking-tight mb-3">
              Generador de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Ideas</span>
            </h1>
            <p className="text-base text-slate-400 max-w-xl leading-relaxed">
              Transforma pensamientos abstractos en conceptos validados con evidencia científica y análisis de mercado en segundos.
            </p>
          </div>

          {/* Lado Derecho (Decoración) */}
          <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-white/5 to-transparent border border-white/5 shadow-2xl backdrop-blur-sm relative">
            <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full"></div>
            <svg className="w-14 h-14 text-purple-300/80 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Define tu reto</h2>
            <p className="text-xs text-[var(--color-ink-label)]">Ingresa un tema y selecciona ejemplos si lo necesitas.</p>
          </div>
          <form onSubmit={handleIdeaGeneration} className="space-y-4">
            <textarea
              className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/50 placeholder:text-[var(--color-ink-muted)] text-white px-4 py-3 text-base h-32 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Ej. Tendencias de innovación en IA para negocios"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              disabled={loadingIdea}
            />
            <div className="flex flex-wrap gap-3">
              {sampleAreas.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="rounded-full border border-slate-700/50 bg-slate-800/40 px-4 py-1.5 text-sm text-[var(--color-ink-soft)] hover:bg-purple-900/20 hover:border-purple-500 transition"
                  onClick={() => setTopic(sample)}
                >
                  {sample}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl btn-primary py-3 text-[var(--color-ink-strong)] font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-purple-500/20"
              disabled={loadingIdea}
            >
              {loadingIdea ? 'Generando...' : 'Generar idea con respaldo científico'}
            </button>
          </form>
        </section>

        {loadingIdea && (
          <div ref={loadingRef} className="glass-panel rounded-3xl p-6 flex flex-col gap-4 animate-pulse scroll-mt-24">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-ink-subtle)]">Procesando</p>
            <h4 className="text-2xl font-bold text-[var(--color-ink-strong)]">{loadingSteps[progressIndex].title}</h4>
            <p className="text-sm text-[var(--color-ink-muted)]">{loadingSteps[progressIndex].description}</p>
            <p className="text-xs text-[var(--color-ink-subtle)]">Conectando con Gemini · Revisando artículos · Aplicando rúbrica</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {toast && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{toast}</div>
        )}

        {ideas.length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-4">
              {ideas.map((idea) => (
                <div
                  key={idea.ideaTitle}
                  className="relative overflow-hidden rounded-[2rem] bg-[#131620] border border-white/10 p-8 shadow-xl hover:border-purple-500/30 transition-all group"
                >
                  {/* Decoración Hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 relative z-10">
                    <div className="space-y-3 sm:max-w-3xl">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-bold tracking-[0.2em] uppercase">
                        Idea Candidata
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">{idea.ideaTitle}</h3>
                      <p className="text-base text-slate-400 leading-relaxed">{idea.ideaSummary}</p>
                      
                      {/* Chips de Innovación */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="px-3 py-1 rounded-lg bg-black/30 border border-white/5 text-xs text-slate-500">
                          🎯 {idea.targetPersona}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-black/30 border border-white/5 text-xs text-slate-500">
                          💡 {idea.innovationAngle.substring(0, 40)}...
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="self-start sm:self-center shrink-0 rounded-xl bg-white text-black font-bold text-sm px-6 py-3 hover:bg-purple-400 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex items-center gap-2"
                      onClick={() => handleSaveAndContinue(idea)}
                    >
                      Profundizar
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default IdeaGeneratorPage;