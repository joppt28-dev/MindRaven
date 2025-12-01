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

const buildValidationPlaybook = (projectType = 'innovation', idea = {}) => {
  const persona =
    typeof idea.targetPersona === 'string' && idea.targetPersona.trim().length
      ? idea.targetPersona.trim()
      : 'usuarios objetivo';
  const personaLower = persona.toLowerCase();
  const opportunity =
    (typeof idea.innovationAngle === 'string' && idea.innovationAngle.trim().length
      ? idea.innovationAngle.trim()
      : typeof idea.ideaTitle === 'string' && idea.ideaTitle.trim().length
      ? idea.ideaTitle.trim()
      : 'la propuesta');

  const sharedMethods = [
    `Encuestas rapidas a ${personaLower} para medir interes y disposicion a pagar.`,
    'Entrevistas cualitativas de 15 minutos para profundizar en los principales dolores.',
  ];

  const innovationSpecific = [
    'Prototipo navegable en Figma o Slides para validar narrativa de valor.',
    'Smoke test o landing page con CTA directo para medir interes real.',
  ];

  const researchSpecific = [
    'Revision sistematica reducida para identificar marcos comparables.',
    `Focus group con representantes de ${personaLower} para validar la hipotesis.`,
  ];

  const methods =
    projectType === 'research'
      ? [...sharedMethods, ...researchSpecific]
      : [...sharedMethods, ...innovationSpecific];

  const successMetrics =
    projectType === 'research'
      ? [
          'Numero de referencias academicas alineadas con la hipotesis.',
          'Participantes que confirman la pertinencia del problema (>70%).',
          'Tiempo promedio para obtener consentimiento o participacion.',
        ]
      : [
          'Usuarios que completan el flujo del prototipo sin friccion (>60%).',
          'Intentos de registro o leads capturados en la landing.',
          'Validacion de rango de precio o presupuesto estimado.',
        ];

  const solutionSummary =
    typeof idea.ideaSummary === 'string' && idea.ideaSummary.trim().length
      ? idea.ideaSummary.trim()
      : `Resolver las fricciones actuales que enfrentan ${personaLower}.`;

  const prototypeModules =
    projectType === 'research'
      ? [
          `Panel de hipótesis donde los investigadores priorizan qué supuestos de ${opportunity.toLowerCase()} validar primero.`,
          `Repositorio colaborativo para subir literatura y transcripciones de ${personaLower}, etiquetando hallazgos por impacto.`,
          'Dashboard de progreso para comparar señal académica vs. señal de campo en tiempo real.',
        ]
      : [
          `Onboarding guiado que ayuda a ${personaLower} a describir su contexto en menos de 2 minutos.`,
          `Módulo principal donde se ejecuta ${opportunity.toLowerCase()} con recomendaciones personalizadas.`,
          'Centro de métricas que evidencia el antes/después y mide la disposición a pagar.',
        ];

  const highFidelityPrototype = {
    vision: `Diseña un prototipo navegable (Figma, Framer o build ligero) que simule el flujo completo de ${opportunity.toLowerCase()} y permita a ${personaLower} sentir cómo se resuelve su día a día. Describe explícitamente cómo se verán los estados clave y qué dato o acción se espera en cada pantalla.`,
    coreModules: prototypeModules,
    heroMoments: [
      `Momento “ajá”: los ${personaLower} visualizan resultados o insights accionables derivados de ${opportunity.toLowerCase()}.`,
      'Momento de compromiso: se les propone reservar/pagar por el módulo más crítico sin mencionar precio para observar su reacción.',
      'Momento de retorno: se muestra cómo compartir métricas con un tercero (jefe, cliente, comité) para reforzar el valor.',
    ],
    summary: solutionSummary,
  };

  const interviewScript = {
    introduction:
      'Explica que la conversación busca evidencia real, no vender. Ancla la charla en momentos vividos y deja claro que más del 50% de las preguntas se adaptarán sobre la marcha a partir de lo que cuenten.',
    adaptationNote:
      'Cultiva silencio incómodo y escucha activa; improvisa nuevas preguntas si surge información extrema o concreta.',
    sections: [
      {
        title: 'Experiencia reciente y contexto',
        focus:
          'Explora hechos reales antes de hablar de soluciones. Pregunta por la última ocasión donde el problema apareció y qué consecuencia tuvo.',
        prompts: [
          'Cuéntame la última vez que enfrentaste este problema. ¿Qué desencadenó ese momento y quién más se vio involucrado?',
          '¿Qué te impidió hacer tu problema y por qué dolió tanto esa vez?',
        ],
      },
      {
        title: 'Acciones y recursos usados',
        focus:
          'Busca evidencia de compromiso. Identifica herramientas, aliados o dinero invertido para solucionarlo.',
        prompts: [
          '¿Qué recursos, herramientas o personas has utilizado para resolverlo? ¿Cuánto tiempo o dinero te costó?',
          '¿Cómo evaluaste si esas alternativas funcionaban y qué faltó?',
        ],
      },
      {
        title: 'Gravedad y priorización',
        focus:
          'Comprende qué parte del problema duele más y por cuál pagarían ahora mismo.',
        prompts: [
          'De todo lo que mencionaste, ¿qué parte es la más grave y por cuál estarías dispuesto a pagar ahora mismo?',
          '¿Qué hace que esa parte sea crítica en tu contexto o nicho específico?',
        ],
      },
      {
        title: 'Reacción ante el MVP',
        focus:
          'Introduce la “ficción” de pago sin dar precio. Busca señales de compromiso real, no cumplidos.',
        prompts: [
          `Si te pudiera habilitar hoy el módulo de ${opportunity.toLowerCase()} que describimos, ¿qué tendrías que ver para transferirme dinero al terminar la llamada?`,
          '¿Quién tendría que aprobar esa compra y qué objeciones anticipas?',
        ],
      },
      {
        title: 'Expertos y próximos pasos',
        focus:
          'Detecta referentes y abre la puerta a más entrevistas dentro del nicho.',
        prompts: [
          `¿Quién más dentro de ${personaLower} ha intentado resolverlo y debería entrevistar?`,
          '¿Qué indicador te confirmaría que vale la pena continuar hablando conmigo?',
        ],
      },
    ],
    closing:
      'Cierra agradeciendo y preguntando explícitamente si están listos para pagar por el entregable crítico; anota objeciones. Agenda seguimiento solo si hay señales basadas en evidencia.',
  };

  return {
    methods,
    highFidelityPrototype,
    interviewScript,
    successMetrics,
  };
};

const mergeValidationPlan = (incomingPlan = {}, projectType, idea) => {
  const basePlan = buildValidationPlaybook(projectType, idea);

  if (!incomingPlan || !Object.keys(incomingPlan).length) {
    return basePlan;
  }

  return {
    ...basePlan,
    ...incomingPlan,
    methods: incomingPlan.methods?.length ? incomingPlan.methods : basePlan.methods,
    successMetrics: incomingPlan.successMetrics?.length ? incomingPlan.successMetrics : basePlan.successMetrics,
    highFidelityPrototype: incomingPlan.highFidelityPrototype || basePlan.highFidelityPrototype,
    interviewScript: incomingPlan.interviewScript || basePlan.interviewScript,
  };
};

const ProjectFlowPage = () => {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const defaultProjectType = 'innovation';
  
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
  const [activeValidationModal, setActiveValidationModal] = useState(null);
  const modalTitles = {
    methods: 'Métodos sugeridos',
    prototype: 'Prototipo de alta fidelidad',
    interviews: 'Guion de entrevistas',
    metrics: 'Métricas de éxito',
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const openValidationModal = (type) => setActiveValidationModal(type);
  const closeValidationModal = () => setActiveValidationModal(null);

  const renderValidationModalContent = () => {
    if (!flow?.validation || !activeValidationModal) return null;
    const { validation } = flow;

    switch (activeValidationModal) {
      case 'methods':
        return (
          <ul className="space-y-2 text-sm text-slate-200">
            {(validation.methods || []).map((method) => (
              <li key={method} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{method}</span>
              </li>
            ))}
          </ul>
        );
      case 'prototype': {
        const proto = validation.highFidelityPrototype;
        if (typeof proto === 'string') {
          return <p className="text-sm text-slate-200">{proto}</p>;
        }
        if (proto && typeof proto === 'object') {
          return (
            <div className="space-y-4 text-sm text-slate-200">
              {proto.summary && <p>{proto.summary}</p>}
              {proto.vision && <p className="text-slate-300">{proto.vision}</p>}
              {Array.isArray(proto.coreModules) && proto.coreModules.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Flujos esenciales</p>
                  <ul className="space-y-2">
                    {proto.coreModules.map((module) => (
                      <li key={module} className="flex items-start gap-2">
                        <span className="text-purple-300 mt-0.5">▹</span>
                        <span>{module}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(proto.heroMoments) && proto.heroMoments.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Momentos clave</p>
                  <ul className="space-y-2">
                    {proto.heroMoments.map((moment) => (
                      <li key={moment} className="flex items-start gap-2">
                        <span className="text-emerald-300 mt-0.5">✦</span>
                        <span>{moment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        }
        return null;
      }
      case 'interviews': {
        const script = validation.interviewScript || {};
        return (
          <div className="space-y-4 text-sm text-slate-200">
            {script.introduction && <p>{script.introduction}</p>}
            {script.adaptationNote && <p className="text-xs text-slate-400 italic">{script.adaptationNote}</p>}
            <div className="space-y-3">
              {(script.sections || []).map((section) => (
                <div key={section.title} className="rounded-xl border border-white/10 p-3 space-y-2">
                  <p className="text-sm font-semibold text-white">{section.title}</p>
                  {section.focus && <p className="text-xs text-slate-400">{section.focus}</p>}
                  <ul className="space-y-1">
                    {(section.prompts || []).map((prompt) => (
                      <li key={prompt} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">?</span>
                        <span>{prompt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {script.closing && <p>{script.closing}</p>}
          </div>
        );
      }
      case 'metrics':
        return (
          <ul className="space-y-2 text-sm text-slate-200">
            {(validation.successMetrics || []).map((metric) => (
              <li key={metric} className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>{metric}</span>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

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
          projectType: defaultProjectType // Por defecto
        }),
      });

      const derivedProjectType = data?.profile?.projectType || defaultProjectType;
      const derivedIdea = data?.define?.idea || ideaData;
      const validationPlan = mergeValidationPlan(
        data?.validation,
        derivedProjectType,
        derivedIdea,
      );

      setFlow({
        ...data,
        validation: validationPlan,
      });
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
    <>
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
            {flow.confirm && (
              <section className="bg-gradient-to-br from-[#131620] to-[#0f1115] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
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

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {flow.confirm.rubric?.map((r) => (
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
            )}

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

              {/* Señal de Premium - Más Artículos */}
              {flow.locate.articles?.length >= 8 && (
                <div className="mt-8 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 p-6 shadow-xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📚</span>
                        <h4 className="text-lg font-bold text-white">¿Necesitas más evidencia?</h4>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Acceso a cientos de artículos académicos y análisis avanzado con <span className="font-semibold text-cyan-300">Premium</span>.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105"
                    >
                      Upgrade Premium
                    </button>
                  </div>
                </div>
              )}
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

            {flow.validation && (
              <section className="rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-[#141827] to-[#0f1420] p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-bold mb-2">Validación de Ideas</p>
                    <h3 className="text-2xl font-bold text-white">Recomendaciones para comprobar la oportunidad</h3>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-2">Métodos sugeridos</p>
                      <p className="text-sm text-slate-300">
                        Activa rápido la conversación con tu segmento y entiende señales tempranas.
                      </p>
                      <ul className="mt-3 space-y-1 text-sm text-slate-400">
                        {(flow.validation.methods || []).slice(0, 2).map((method) => (
                          <li key={method} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{method}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      className="self-start px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/20 transition"
                      onClick={() => openValidationModal('methods')}
                    >
                      Ver detalle completo
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-2">Prototipo de alta fidelidad</p>
                      <p className="text-sm text-slate-300">Define cómo luce tu MVP y qué debe demostrar.</p>
                      <p className="mt-3 text-sm text-slate-400 max-h-24 overflow-hidden">
                        {typeof flow.validation.highFidelityPrototype === 'string'
                          ? flow.validation.highFidelityPrototype
                          : flow.validation.highFidelityPrototype?.summary || 'Describe cómo tu solución cobra vida.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="self-start px-3 py-1.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-200 border border-purple-400/30 hover:bg-purple-500/20 transition"
                      onClick={() => openValidationModal('prototype')}
                    >
                      Ver detalle completo
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 flex flex-col gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Guion de entrevistas</p>
                        <span className="text-[10px] font-bold text-emerald-300 border border-emerald-400/30 rounded-full px-2 py-0.5">
                          Premium
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">
                        Preguntas basadas en evidencia para obtener respuestas accionables.
                      </p>
                      {flow.validation.interviewScript?.introduction && (
                        <p className="mt-3 text-sm text-slate-400 max-h-24 overflow-hidden">
                          {flow.validation.interviewScript.introduction}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="self-start px-3 py-1.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-200 border border-sky-400/30 hover:bg-sky-500/20 transition"
                      onClick={() => openValidationModal('interviews')}
                    >
                      Ver detalle completo
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-2">Métricas de éxito</p>
                      <p className="text-sm text-slate-300">Define cómo sabrás que la validación funcionó.</p>
                      <ul className="mt-3 space-y-1 text-sm text-slate-400">
                        {(flow.validation.successMetrics || []).slice(0, 2).map((metric) => (
                          <li key={metric} className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">•</span>
                            <span>{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      className="self-start px-3 py-1.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-200 border border-cyan-400/30 hover:bg-cyan-500/20 transition"
                      onClick={() => openValidationModal('metrics')}
                    >
                      Ver detalle completo
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>

      {activeValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeValidationModal}
          ></div>
          <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0b0f19] shadow-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Detalle</p>
                <h4 className="text-xl font-semibold text-white">{modalTitles[activeValidationModal]}</h4>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-white transition"
                onClick={closeValidationModal}
              >
                ×
              </button>
            </div>
            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2">
              {renderValidationModalContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectFlowPage;
