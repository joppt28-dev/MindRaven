const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_MAX_ATTEMPTS = Number(process.env.GEMINI_MAX_ATTEMPTS) || 4;

const promptTemplate = (topic) => `Eres MindRaven, estratega senior de innovacion y mentor de startups.
El usuario desea explorar oportunidades sobre: "${topic}".

Devuelve un JSON con un arreglo "ideas" de EXACTAMENTE 3 objetos, cada uno con las llaves:
{
  "ideaTitle": "...",
  "ideaSummary": "...",
  "innovationAngle": "...",
  "validationFocus": ["...", "..."],
  "actionSteps": ["...", "..."],
  "targetPersona": "...",
  "trendSignals": ["...", "..."]
}

Cada idea debe ser especifica, solida y claramente diferenciada de las otras (enfoque, segmento, modelo o tecnologia), viable para startups y con enfoque latinoamericano cuando aplique.`;

const fallbackProfiles = [
  {
    title: (topic) => `Laboratorio de Inteligencia Territorial para ${topic}`,
    summary: (topic) =>
      `Construye un observatorio ciudadano que mapea retos de ${topic} cruzando reportes comunitarios, datos satelitales y literatura abierta para priorizar intervenciones.`,
    innovationAngle:
      'Fusiona IA generativa con datos abiertos (censos, sensores e imagen satelital) para priorizar proyectos con evidencia.',
    targetPersona: 'Municipalidades, ONGs de impacto social y universidades publicas.',
    validationFocus: [
      'Pilotos con gobiernos locales para validar utilidad de la priorizacion.',
      'Contrastarla contra indicadores oficiales y feedback comunitario.',
    ],
    actionSteps: [
      'Disenar un pipeline de ingestion de datos y testimonios locales.',
      'Construir un tablero que recomiende intervenciones priorizadas.',
      'Validar el modelo con 3 municipios y documentar ROI social.',
    ],
    trendSignals: [
      'Politicas de datos abiertos en America Latina.',
      'Adopcion de IA civica para priorizar programas sociales.',
    ],
  },
  {
    title: (topic) => `Marketplace de Pilotos Industriales para ${topic}`,
    summary: (topic) =>
      `Lanza una plataforma B2B que conecta startups deeptech de ${topic} con plantas industriales y utilities para ejecutar pilotos medibles.`,
    innovationAngle: 'Estandariza contratos de piloto y usa IA para empatar retos operativos con soluciones emergentes.',
    targetPersona: 'Operaciones industriales, utilities y fondos corporate venture.',
    validationFocus: [
      'Validar willingness to pay por piloto cerrado con KPIs compartidos.',
      'Testear velocidad de onboarding de proveedores y compliance.',
    ],
    actionSteps: [
      'Mapear 20 retos industriales y clasificarlos por ROI esperado.',
      'Crear plantillas legales y tableros de resultados por piloto.',
      'Lanzar cohortes trimestrales y medir repeticion de clientes.',
    ],
    trendSignals: [
      'Corporativos buscando pilotos de bajo riesgo.',
      'Relevancia de net zero y mantenimiento predictivo.',
    ],
  },
  {
    title: (topic) => `Plataforma de Co-creacion Ciudadana para ${topic}`,
    summary: (topic) =>
      `Desarrolla una app de experiencias participativas para que habitantes de ${topic} documenten problemas cotidianos y co-disenen soluciones con instituciones.`,
    innovationAngle: 'Usa IA generativa para convertir audios y textos en historias accionables y mapas de calor.',
    targetPersona: 'Secretarias de ciudadania, colectivos barriales y laboratorios de gobierno abierto.',
    validationFocus: [
      'Medir recurrencia de usuarios y calidad de relatos recopilados.',
      'Comparar las prioridades ciudadanas con planes oficiales.',
    ],
    actionSteps: [
      'Activar comunidades piloto en escuelas o centros culturales.',
      'Entrenar modelos de clasificacion de relatos y riesgo.',
      'Correr sprints de codesignio y publicar informes trimestrales.',
    ],
    trendSignals: [
      'Participacion ciudadana digital post pandemia.',
      'Adopcion de civic-tech enfocada en movilidad y seguridad.',
    ],
  },
  {
    title: (topic) => `Campus de Talento Aplicado para ${topic}`,
    summary: (topic) =>
      `Crea un campus virtual que convierte investigaciones sobre ${topic} en proyectos aplicados con empresas y gobiernos regionales.`,
    innovationAngle:
      'Transforma papers y tesis en retos accionables usando IA para resumir hallazgos, disenar MVPs y estimar impacto.',
    targetPersona: 'Universidades privadas, centros de I+D y clusters empresariales.',
    validationFocus: [
      'Medir conversion de tesis a proyectos financiados.',
      'Monitorear satisfaccion de mentores corporativos y estudiantes.',
    ],
    actionSteps: [
      'Seleccionar cartera de investigaciones de alto potencial.',
      'Disenar playbooks de transferencia tecnologica en 12 semanas.',
      'Firmar acuerdos con empresas ancla para financiar pilotos.',
    ],
    trendSignals: [
      'Programas de talento enfocados en deeptech.',
      'Fondos publicos para vincular academia-empresa.',
    ],
  },
];

const buildFallbackIdea = (topicLabel, profile, index = 0) => ({
  ideaTitle: profile.title(topicLabel, index),
  ideaSummary: profile.summary(topicLabel, index),
  innovationAngle: profile.innovationAngle,
  validationFocus: profile.validationFocus,
  actionSteps: profile.actionSteps,
  targetPersona: profile.targetPersona,
  trendSignals: profile.trendSignals,
});

const getFallbackIdeas = (topic, count = 3) => {
  const topicLabel = topic && topic.trim().length ? topic.trim() : 'Latam';
  const ideas = [];
  let profileIndex = 0;
  while (ideas.length < count) {
    const profile = fallbackProfiles[profileIndex % fallbackProfiles.length];
    ideas.push(buildFallbackIdea(topicLabel, profile, profileIndex));
    profileIndex += 1;
  }
  return ideas;
};

const makeIdeaKey = (idea = {}) => {
  const title = (idea.ideaTitle || '').toLowerCase().trim();
  const summary = (idea.ideaSummary || '').toLowerCase().trim();
  const persona = (idea.targetPersona || '').toLowerCase().trim();
  return `${title}|${summary}|${persona}`;
};

const ensureDiverseIdeas = (ideas = [], topic, desired = 3) => {
  const seen = new Set();
  const uniqueIdeas = [];

  const pushIdea = (idea) => {
    if (!idea) return;
    const key = makeIdeaKey(idea);
    if (seen.has(key)) return;
    seen.add(key);
    uniqueIdeas.push(idea);
  };

  ideas.forEach(pushIdea);

  if (uniqueIdeas.length < desired) {
    getFallbackIdeas(topic, desired).forEach(pushIdea);
  }

  // Si aun asi falta, duplica perfiles con sufijo incremental
  let suffix = 1;
  while (uniqueIdeas.length < desired) {
    const profile = fallbackProfiles[suffix % fallbackProfiles.length];
    const synthetic = buildFallbackIdea(topic || 'Latam', profile, suffix);
    synthetic.ideaTitle = `${synthetic.ideaTitle} v${suffix + 1}`;
    pushIdea(synthetic);
    suffix += 1;
  }

  return uniqueIdeas.slice(0, desired);
};

const normalizeGeminiIdeas = (geminiIdea) => {
  if (!geminiIdea) return [];
  if (Array.isArray(geminiIdea.ideas)) return geminiIdea.ideas;
  if (Array.isArray(geminiIdea)) return geminiIdea;
  if (geminiIdea?.ideaTitle) return [geminiIdea];
  return [];
};

const collectGeminiIdeas = async (topic, desired = 3) => {
  const aggregated = [];
  const seen = new Set();
  let lastError = null;
  /* eslint-disable no-console */

  for (let attempt = 0; attempt < GEMINI_MAX_ATTEMPTS; attempt += 1) {
    try {
      console.log(`[Gemini] Intento ${attempt + 1}/${GEMINI_MAX_ATTEMPTS} para tema: "${topic}"`);
      const geminiIdea = await callGemini(topic);
      const chunk = normalizeGeminiIdeas(geminiIdea);
      
      console.log(`[Gemini] Respuesta contiene ${chunk.length} idea(s)`);
      
      if (!chunk.length) {
        lastError = new Error('Gemini no devolvió ideas válidas.');
        continue;
      }
      
      chunk.forEach((idea) => {
        const key = makeIdeaKey(idea);
        if (!key || seen.has(key)) {
          console.log('[Dedup] Idea duplicada ignorada:', idea.ideaTitle);
          return;
        }
        seen.add(key);
        aggregated.push(idea);
        console.log('[Gemini] Idea agregada:', idea.ideaTitle);
      });
      
      if (aggregated.length >= desired) {
        console.log(`[Gemini] Se alcanzaron ${aggregated.length} ideas únicas. Deteniendo.`);
        break;
      }
    } catch (error) {
      console.warn(`[Gemini] Error en intento ${attempt + 1}:`, error.message);
      lastError = error;
    }
  }
  /* eslint-enable no-console */

  if (!aggregated.length && lastError) {
    throw lastError;
  }

  console.log(`[Gemini] Total de ideas únicas recolectadas: ${aggregated.length}`);
  return aggregated;
};

const tryParseJson = (candidate) => {
  try {
    return candidate ? JSON.parse(candidate) : null;
  } catch (_error) {
    return null;
  }
};

const sanitizeJson = (text = '') => {
  if (!text.trim()) {
    return null;
  }

  const cleaned = text.replace(/```json/gi, '```').replace(/```/g, '').trim();
  const direct = tryParseJson(cleaned);
  if (direct) {
    return direct;
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return tryParseJson(cleaned.slice(firstBrace, lastBrace + 1));
  }

  return null;
};

const callGemini = async (topic) => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no está configurada.');
  }

  const response = await axios.post(
    `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: promptTemplate(topic) }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1500,
      },
    },
    {
      timeout: 15000,
    },
  );

  const parts = response.data?.candidates?.[0]?.content?.parts || [];
  const rawText = parts.map((part) => part.text || '').join('\n').trim();
  const parsed = rawText ? sanitizeJson(rawText) : null;
  
  if (!parsed || !parsed.ideas || !Array.isArray(parsed.ideas) || parsed.ideas.length === 0) {
    throw new Error('Gemini no devolvió ideas válidas en el formato esperado.');
  }
  
  return parsed;
};

const generateIdea = async (topic) => {
  try {
    const aggregatedIdeas = await collectGeminiIdeas(topic, 3);
    
    if (!aggregatedIdeas || aggregatedIdeas.length === 0) {
      throw new Error('Gemini no generó ideas válidas después de múltiples intentos.');
    }
    
    const enrichedIdeas = ensureDiverseIdeas(aggregatedIdeas, topic, 3);
    return { ideas: enrichedIdeas };
  } catch (error) {
    /* eslint-disable no-console */
    console.warn(`Fallo al generar idea con modelo IA para tema "${topic}":`, error.message);
    /* eslint-enable no-console */
    
    // Solo usa fallback si realmente no hay datos de IA
    return { ideas: getFallbackIdeas(topic, 3) };
  }
};

module.exports = {
  generateIdea,
};
