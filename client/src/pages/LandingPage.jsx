import { Link } from 'react-router-dom';
import heroImage from '../assets/hero-ia.jpg';
import AppFitnessImage from '../assets/app-fitness.jpg';
import PodcastAppImage from '../assets/podcast-app.jpg';
import CampañaStartupImage from '../assets/campañaStartup-app.jpg';


const LogoDots = () => (
  <div className="grid grid-cols-6 gap-6 justify-items-center mt-6 opacity-70">
    {[...Array(6)].map((_, idx) => (
      <div
        key={idx}
        className="h-2 w-10 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#3b82f6] opacity-70"
      />
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
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
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

  return (
    <div className="min-h-screen bg-transparent text-[var(--color-ink-strong)]">
    

    <div className="max-w-6xl mx-auto px-4 pt-8 pb-16 grid gap-10 md:grid-cols-2 items-center">
      <div className="space-y-5">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">IA para proyectos</p>
        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
          Transforma tus ideas en proyectos estructurados con IA
        </h1>
        <p className="text-base text-[var(--color-ink)] max-w-xl">
          MindRaven te ayuda a generar, desarrollar y organizar conceptos hasta convertirlos en planes accionables, con
          evidencia y validación integrada.
        </p>
        <div className="flex flex-row gap-4 mt-8 w-full max-w-lg">
          <Link
            to="/projects/select"
            className="btn-primary text-center px-5 py-3 rounded-full text-sm font-semibold shadow-lg shadow-blue-500/20"
          >
            Genera tu primer proyecto
          </Link>
          <Link
            to="/ideas"
            className="px-5 py-3 text-center rounded-full border border-[var(--color-border)] hover:bg-[var(--color-panel)] text-sm font-semibold text-[var(--color-ink)]"
          >
            Probar generador clásico
          </Link>
        </div>
      </div>
        <div className = "flex justify-center">
          <div className = "relative h-80 w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden group bg-[#131620]">
          <div className = "absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <img
            src={heroImage}
            alt="IA analizando evidencia científica" 
            className="relative w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#131620]/60 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-6 left-6 backdrop-blur-md bg-black/60 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-xs font-semibold text-white tracking-wide">Análisis en tiempo real</span>
          </div>
        </div>
      </div>
    </div>

    <LogoDots />

    <div className="max-w-6xl mx-auto px-4 py-14 space-y-8">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">Herramientas inteligentes</p>
        <h2 className="text-3xl font-bold">Da vida a tus ideas</h2>
        <p className="text-sm text-[var(--color-ink)]">
          Onboarding, generación asistida, evidencia reciente y validación en un solo lugar.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard title="Estructura con IA" desc="Organiza retos en ideas claras, listas para ejecutar." icon="🧭" />
        <FeatureCard
          title="Exploración con evidencia"
          desc="Artículos recientes de Semantic Scholar y CrossRef priorizados."
          icon="📑"
        />
        <FeatureCard
          title="Validación y scoring"
          desc="Rúbrica automática de oportunidad para priorizar qué construir."
          icon="📈"
        />
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 py-14 space-y-8">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">Ejemplos generados</p>
        <h2 className="text-3xl font-bold">Proyectos que puedes crear</h2>
        <p className="text-sm text-[var(--color-ink)]">
          Desde academic research hasta innovación aplicada: elige y profundiza.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <ExampleCard title="Plan de Negocios para app de fitness" subtitle="Monetización, marketing y MVP listo." imageSrc={AppFitnessImage}/>
        <ExampleCard title="Guion para podcast de tecnología" subtitle="Temario, entrevistas y conclusiones." imageSrc={PodcastAppImage}/>
        <ExampleCard title="Campaña de marketing para startup" subtitle="Segmentación, calendario y contenidos." imageSrc={CampañaStartupImage}/>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 pb-16">
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-3xl p-8 text-center space-y-3">
        <h3 className="text-2xl font-semibold">¿Listo para lanzar tu próxima idea?</h3>
        <p className="text-sm text-[var(--color-ink)]">
          Supera bloqueos creativos y valida con evidencia. Empieza gratis.
        </p>
        <Link
          to="/register"
          className="inline-flex justify-center btn-primary px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-blue-500/20"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </div>
  </div>
  );
};

export default LandingPage;
