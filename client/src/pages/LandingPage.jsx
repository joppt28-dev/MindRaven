import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- IMÁGENES ---
import heroImage from '../assets/hero-ia.jpg';
import logoImage from '../assets/logo-MR.png';
import AppFitnessImage from '../assets/app-fitness.jpg';
import PodcastAppImage from '../assets/podcast-app.jpg';
import CampañaStartupImage from '../assets/campañaStartup-app.jpg';

// Componentes decorativos
const LogoDots = () => (
  <div className="grid grid-cols-6 gap-6 justify-items-center mt-6 opacity-70">
    {[...Array(6)].map((_, idx) => (
      <div key={idx} className="h-2 w-10 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#3b82f6] opacity-70" />
    ))}
  </div>
);

const FeatureCard = ({ title, desc, icon }) => (
  <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-2xl p-5 space-y-2 shadow-lg">
    <div className="flex items-center gap-3 text-sm font-semibold text-[var(--color-ink-muted)]">
      <span className="text-lg">{icon}</span>
      <span>{title}</span>
    </div>
    <p className="text-sm text-[var(--color-ink)]">{desc}</p>
  </div>
);

const ExampleCard = ({ title, subtitle, imageSrc }) => (
  <div className="bg-[#131620] border border-white/5 rounded-2xl p-4 space-y-3 shadow-lg overflow-hidden hover:border-purple-500/30 transition-colors group h-full">
    <div className="h-32 w-full rounded-xl overflow-hidden relative">
      {imageSrc ? (
        <img src={imageSrc} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-800/60 via-slate-800/50 to-slate-900/70 group-hover:bg-slate-800 transition-colors" />
      )}
    </div>
    <div>
      <h4 className="text-base font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </div>
  </div>
);

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Función inteligente para el botón "Empezar"
  const handleStart = () => {
    if (user) {
      // Si ya está logueado -> Ir al Generador
      navigate('/ideas');
    } else {
      // Si no -> Ir al Login
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[var(--color-ink-strong)] relative selection:bg-purple-500 selection:text-white">
      
      {/* --- NAVBAR MINIMALISTA --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* 1. LOGO (Izquierda) */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src={logoImage} 
              alt="MindRaven" 
              className="h-9 w-auto object-contain"
              onError={(e) => {e.target.style.display='none'}} 
            />
            <span className="font-bold text-xl md:text-2xl tracking-wide text-white">MindRaven</span>
          </div>

          {/* 2. BOTÓN ÚNICO "EMPEZAR" (Derecha) */}
          <button
            onClick={handleStart}
            className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-bold text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0B0F19]"
          >
            <span className="relative flex items-center gap-2">
              Empezar
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

        </div>
      </nav>

      {/* --- CONTENIDO CON PADDING SUPERIOR --- */}
      <div className="pt-28">
        
        {/* HERO SECTION */}
        <div className="max-w-6xl mx-auto px-4 pb-16 grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
              IA para proyectos
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
              Transforma tus ideas en <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">proyectos reales</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              MindRaven te ayuda a generar, desarrollar y organizar conceptos hasta convertirlos en planes accionables, con
              evidencia y validación integrada.
            </p>
            
            {/* BOTONES HERO */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full max-w-md">
              <button 
                onClick={handleStart}
                className="flex-1 flex items-center justify-center text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base whitespace-nowrap"
              >
                Genera tu primer proyecto
              </button>
              <Link to="/ideas" className="flex-1 flex items-center justify-center text-center bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-semibold py-3.5 px-6 rounded-full transition-all hover:border-white/20 active:scale-[0.98] text-sm sm:text-base whitespace-nowrap">
                Probar generador clásico
              </Link>
            </div>
          </div>

          {/* IMAGEN HERO */}
          <div className="flex justify-center">
            <div className="relative h-80 w-full max-w-md rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden group bg-[#131620]">
              <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <img
                src={heroImage}
                alt="IA analizando evidencia científica"
                className="relative w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                onError={(e) => e.target.style.display = 'none'}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2rem] pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#131620] via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-black/60 border border-white/10 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                   <span className="text-xs font-semibold text-white tracking-wide">Análisis en tiempo real</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LogoDots />

        {/* FEATURES */}
        <div className="max-w-6xl mx-auto px-4 py-20 space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold">Herramientas inteligentes</p>
            <h2 className="text-3xl font-bold text-white">Todo lo que necesitas para innovar</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Desde la chispa inicial hasta la validación de mercado. Todo en una sola plataforma.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard title="Estructura con IA" desc="Organiza retos en ideas claras, listas para ejecutar con asistencia inteligente." icon="🧭" />
            <FeatureCard title="Exploración con evidencia" desc="Artículos recientes de Semantic Scholar y CrossRef priorizados automáticamente." icon="📑" />
            <FeatureCard title="Validación y scoring" desc="Rúbrica automática de oportunidad para priorizar qué construir primero." icon="📈" />
          </div>
        </div>

        {/* EJEMPLOS */}
        <div className="max-w-6xl mx-auto px-4 py-10 pb-24 space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-400 font-bold">Inspiración</p>
            <h2 className="text-3xl font-bold text-white">Proyectos que puedes crear</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <ExampleCard title="Plan de Negocios Fitness" subtitle="Monetización, marketing y MVP listo." imageSrc={AppFitnessImage}/>
            <ExampleCard title="Guion Podcast Tech" subtitle="Temario, entrevistas y conclusiones." imageSrc={PodcastAppImage}/>
            <ExampleCard title="Campaña Startup" subtitle="Segmentación, calendario y contenidos." imageSrc={CampañaStartupImage}/>
          </div>
        </div>

        {/* CTA FINAL */}
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1F2E] to-[#131620] border border-white/10 rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <h3 className="text-3xl font-bold text-white relative z-10">¿Listo para lanzar tu próxima idea?</h3>
            <p className="text-slate-400 max-w-lg mx-auto relative z-10">
              Supera bloqueos creativos y valida con evidencia científica en segundos. Empieza gratis hoy mismo.
            </p>
            <button 
              onClick={handleStart}
              className="relative z-10 inline-flex justify-center items-center gap-2 btn-primary px-8 py-4 rounded-full text-base font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            >
              Crear cuenta gratis
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;