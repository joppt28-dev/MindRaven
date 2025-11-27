const express = require('express');
const authenticate = require('../middleware/auth');
const supabase = require('../supabase'); // <--- IMPORTANTE: Tu cliente Supabase
const { generateIdea } = require('../services/ideaGenerator');
const { fetchArticles } = require('../services/articleService');
const { scoreIdea } = require('../services/scoringService');
const { validateIdeaRequest } = require('../utils/validateInput');

const router = express.Router();

// ==================================================================
// 1. GUARDAR PROYECTO (POST /api/projects)
// ==================================================================
router.post('/', authenticate, async (req, res) => {
  try {
    const { prompt, ideaData, status } = req.body;
    // req.user viene del middleware authenticate (es el payload del token)
    // En tu authRoutes.js el token tiene 'sub' como ID.
    const userId = req.user.sub; 

    if (!prompt || !ideaData) {
      return res.status(400).json({ message: 'Faltan datos requeridos (prompt o ideaData).' });
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          prompt: prompt,
          idea_data: ideaData,
          status: status || 'active'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);

  } catch (error) {
    console.error('Error guardando proyecto:', error);
    return res.status(500).json({ message: 'Error al guardar en base de datos.' });
  }
});

// ==================================================================
// 2. LISTAR PROYECTOS DEL USUARIO (GET /api/projects)
// ==================================================================
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.sub;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data);

  } catch (error) {
    console.error('Error listando proyectos:', error);
    return res.status(500).json({ message: 'Error al obtener historial.' });
  }
});

// ==================================================================
// 3. OBTENER UN PROYECTO (GET /api/projects/:id)
// ==================================================================
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId) // Seguridad: solo el dueño puede verlo
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Proyecto no encontrado.' });
    }

    return res.json(data);

  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    return res.status(500).json({ message: 'Error al cargar detalle.' });
  }
});


// ==================================================================
// LÓGICA DE NEGOCIO (BOOTSTRAP / GENERACIÓN)
// ==================================================================
// ... (Aquí pegamos las funciones auxiliares que ya tenías: normalizeIdea, etc.)

const normalizeIdea = (idea = {}) => {
  const validationFocus =
    Array.isArray(idea.validationFocus) && idea.validationFocus.length
      ? idea.validationFocus
      : ['Validación con literatura reciente', 'Prueba de adopción con usuarios meta'];

  const actionSteps =
    Array.isArray(idea.actionSteps) && idea.actionSteps.length
      ? idea.actionSteps
      : ['Diseñar piloto', 'Recolectar feedback', 'Ajustar propuesta y métricas'];

  const trendSignals =
    Array.isArray(idea.trendSignals) && idea.trendSignals.length
      ? idea.trendSignals
      : ['Tendencia de adopción de IA en la región', 'Demanda de validación basada en datos'];

  return {
    ideaTitle: idea.ideaTitle || 'Concepto MindRaven',
    ideaSummary:
      idea.ideaSummary ||
      'Explora combinar datos académicos y señales de mercado para lanzar una propuesta diferenciada.',
    innovationAngle:
      idea.innovationAngle ||
      'Uso estratégico de IA generativa y fuentes científicas para justificar la oportunidad.',
    validationFocus,
    actionSteps,
    targetPersona: idea.targetPersona || 'Fundadores y equipos de innovación.',
    trendSignals,
  };
};

const buildIdeaQueryParts = (idea = {}) =>
  [
    idea.ideaTitle,
    idea.ideaSummary,
    idea.innovationAngle,
    idea.targetPersona,
    ...(idea.trendSignals || []),
    ...(idea.validationFocus || []),
    ...(idea.actionSteps || []),
  ].filter(Boolean);

const buildProjectPrepare = (projectType, idea) => {
  // ... (Tu código original de buildProjectPrepare) ...
  if (projectType === 'research') {
    return {
      problema: idea.ideaSummary,
      hipotesis: `Si implementamos ${idea.innovationAngle}, entonces el segmento ${idea.targetPersona} obtendrá mejoras medibles.`,
      objetivos: [
        `Validar el enfoque "${idea.innovationAngle}" con literatura y datos de usuario.`,
        'Cuantificar impacto en eficiencia, costo o experiencia.',
      ],
      justificacion: 'Existe oportunidad confirmada por tendencias y literatura reciente.',
      estadoDelArte: idea.trendSignals,
      metodologia: 'Revisión sistemática + entrevistas semiestructuradas + prototipo rápido.',
      resultadosEsperados: [
        'Ruta metodológica replicable',
        'Evidencia de viabilidad',
        'Aprendizajes para escalamiento',
      ],
    };
  }

  return {
    problema: idea.ideaSummary,
    insightUsuario: `El segmento ${idea.targetPersona} muestra dolores no resueltos relacionados con "${idea.innovationAngle}".`,
    solucion: idea.innovationAngle,
    propuestaValor: idea.validationFocus?.[0] || 'Entrega de valor basada en IA y evidencia académica.',
    segmentoCliente: idea.targetPersona,
    oportunidades: idea.trendSignals,
    validacionInicial: idea.validationFocus,
    mvpCanvas: ['Problema', 'Solución', 'Métrica clave', 'Canales', 'Ingresos/Costos'],
    pitchInicial: `Estamos construyendo ${idea.ideaTitle} para ${idea.targetPersona}, abordando ${idea.innovationAngle}.`,
  };
};

// Mantenemos tu ruta /bootstrap tal cual, es útil para iniciar flujos sin guardar
router.post('/bootstrap', authenticate, async (req, res, next) => {
  try {
    const {
      topic,
      userType,
      goal,
      projectType = 'innovation',
      ideaInput = {},
    } = req.body || {};

    const topicToUse = ideaInput.text || ideaInput.idea?.ideaTitle || topic;
    const validationError = validateIdeaRequest(topicToUse || 'oportunidades');
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    let baseIdea = ideaInput.idea || null;
    if (!baseIdea) {
      const rawIdea = await generateIdea(topicToUse || 'oportunidades de innovación');
      const ideasArray = Array.isArray(rawIdea?.ideas)
        ? rawIdea.ideas
        : rawIdea
        ? [rawIdea]
        : [];
      baseIdea = ideasArray[0] || rawIdea || {};
    }

    const idea = normalizeIdea(baseIdea);
    const ideaQueryParts = buildIdeaQueryParts(idea);
    const ideaQuery = ideaQueryParts.join(' ');

    const keywordTokens = Array.from(
      new Set(
        ideaQueryParts
          .join(' ')
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word && word.length > 4),
      ),
    ).slice(0, 12);

    const articles = await fetchArticles(
      ideaQuery || idea.ideaTitle || idea.innovationAngle,
      keywordTokens,
      ideaQuery,
      idea,
    );

    const scoring = await scoreIdea(idea, articles);
    const prepare = buildProjectPrepare(projectType, idea);

    return res.json({
      profile: { userType, goal, projectType, topic: topicToUse },
      define: {
        mode: ideaInput.mode || 'generated',
        idea,
      },
      locate: {
        articles,
        trendSignals: idea.trendSignals,
        selectedEvidence: [],
      },
      prepare,
      confirm: scoring,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Si falla el bootstrap, pasamos al siguiente middleware de error
    return next({
      status: error.response?.status || 500,
      message: error.message || 'No se pudo construir el flujo del proyecto.',
      details: error.response?.data || null,
    });
  }
});

module.exports = router;