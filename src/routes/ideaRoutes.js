const express = require('express');
const authenticate = require('../middleware/auth');
const { validateIdeaRequest } = require('../utils/validateInput');
const { generateIdea } = require('../services/ideaGenerator');
const { fetchArticles } = require('../services/articleService');
const { scoreIdea } = require('../services/scoringService');

const router = express.Router();

router.post('/', authenticate, async (req, res, next) => {
  const { areaInteres } = req.body || {};
  const validationError = validateIdeaRequest(areaInteres);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const ideaResult = await generateIdea(areaInteres);
    const ideasArray = Array.isArray(ideaResult?.ideas)
      ? ideaResult.ideas
      : ideaResult
      ? [ideaResult]
      : [];

    if (!ideasArray || ideasArray.length === 0) {
      throw new Error('No se generaron ideas válidas. Intenta de nuevo con otro tema.');
    }

    const normalizedIdeas = ideasArray.map((idea) => ({
      ideaTitle: idea.ideaTitle || 'Concepto MindRaven',
      ideaSummary:
        idea.ideaSummary ||
        'Explora combinar datos academicos y senales de mercado para lanzar una propuesta diferenciada.',
      innovationAngle:
        idea.innovationAngle ||
        'Uso estrategico de IA generativa y fuentes cientificas para justificar la oportunidad.',
      validationFocus: Array.isArray(idea.validationFocus) ? idea.validationFocus : [],
      actionSteps: Array.isArray(idea.actionSteps) ? idea.actionSteps : [],
      targetPersona: idea.targetPersona || 'Fundadores y equipos de innovacion.',
      trendSignals: Array.isArray(idea.trendSignals) ? idea.trendSignals : [],
    }));

    const normalizedIdea = normalizedIdeas[0] || {
      ideaTitle: 'Concepto MindRaven',
      ideaSummary:
        'Explora combinar datos academicos y senales de mercado para lanzar una propuesta diferenciada.',
      innovationAngle: 'Uso estrategico de IA generativa y fuentes cientificas para justificar la oportunidad.',
      validationFocus: [],
      actionSteps: [],
      targetPersona: 'Fundadores y equipos de innovacion.',
      trendSignals: [],
    };

    const articleQueryParts = [
      normalizedIdea.ideaTitle,
      normalizedIdea.ideaSummary,
      normalizedIdea.innovationAngle,
      normalizedIdea.targetPersona,
      ...(normalizedIdea.trendSignals || []),
      ...(normalizedIdea.validationFocus || []),
      ...(normalizedIdea.actionSteps || []),
    ].filter(Boolean);

    const ideaQuery = articleQueryParts.join(' ');

    const keywordTokens = Array.from(
      new Set(
        articleQueryParts
          .join(' ')
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word && word.length > 4),
      ),
    ).slice(0, 12);

    const articles = await fetchArticles(
      ideaQuery || normalizedIdea.ideaTitle || normalizedIdea.innovationAngle,
      keywordTokens,
      ideaQuery,
      normalizedIdea, // Pasar contexto completo de la idea
    );
    const scoring = await scoreIdea(normalizedIdea, articles);

    return res.json({
      topic: areaInteres,
      idea: normalizedIdea,
      ideas: normalizedIdeas.slice(0, 3),
      articles,
      scoring,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return next({
      status: error.response?.status || 500,
      message: error.message || 'No se pudo generar la idea.',
      details: error.response?.data || null,
    });
  }
});

module.exports = router;
