const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

const fallbackIdea = (topic) => ({
  ideaTitle: `Explorador de Inteligencia Aplicada para ${topic}`,
  ideaSummary:
    'Desarrolla una plataforma digital que combine analitica de datos y vigilancia tecnologica para priorizar oportunidades emergentes.',
  innovationAngle:
    'Integra IA generativa con resenas automatizadas de literatura academica regional e internacional.',
  validationFocus: [
    'Contrastar hallazgos con bases de datos cientificas (Semantic Scholar, CrossRef).',
    'Entrevistar usuarios objetivo para validar el ajuste problema-solucion.',
  ],
  actionSteps: [
    'Definir nicho inicial y recopilar dataset de articulos y reportes relevantes.',
    'Prototipar un dashboard IA que priorice ideas segun impacto y viabilidad.',
    'Implementar metricas de adopcion y aprendizaje de usuarios tempranos.',
  ],
  targetPersona: 'Equipos de innovacion de startups y universidades con foco en investigacion aplicada.',
  trendSignals: [
    'Auge de herramientas AI co-piloto para ideacion.',
    'Demanda de validacion cientifica rapida para propuestas de valor.',
  ],
});

const sanitizeJson = (text) => {
  try {
    const cleaned = text.trim().replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (_error) {
    return null;
  }
};

const callGemini = async (topic) => {
  if (!GEMINI_API_KEY) {
    return null;
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
        maxOutputTokens: 900,
      },
    },
    {
      timeout: 15000,
    },
  );

  const parts = response.data?.candidates?.[0]?.content?.parts || [];
  const rawText = parts.map((part) => part.text || '').join('\n').trim();
  const parsed = rawText ? sanitizeJson(rawText) : null;
  return parsed;
};

const generateIdea = async (topic) => {
  try {
    const geminiIdea = await callGemini(topic);
    if (geminiIdea) {
      return geminiIdea;
    }
  } catch (error) {
    /* eslint-disable no-console */
    console.warn('Fallo al generar idea con modelo IA, usando respaldo:', error.message);
  }

  return { ideas: [fallbackIdea(topic)] };
};

module.exports = {
  generateIdea,
};
