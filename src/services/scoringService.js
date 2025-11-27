const normalizeText = (text) => (text || '').toLowerCase();

const clampScore = (value) => Math.max(1, Math.min(10, Math.round(value)));

const computeRecencyBoost = (articles = []) => {
  if (!articles.length) return 0.5;
  const years = articles.map((article) => article.year).filter(Boolean);
  if (!years.length) return 0.7;
  const avgYear = years.reduce((sum, year) => sum + year, 0) / years.length;
  const age = new Date().getFullYear() - avgYear;
  return Math.max(0, 2 - age * 0.2);
};

const keywordHits = (text, keywords = []) =>
  keywords.reduce((count, keyword) => (text.includes(keyword) ? count + 1 : count), 0);

const buildCorpus = (idea, articles = []) =>
  normalizeText(
    [
      idea.ideaTitle,
      idea.ideaSummary,
      idea.innovationAngle,
      idea.targetPersona,
      ...(idea.trendSignals || []),
      ...(idea.validationFocus || []),
      ...(idea.actionSteps || []),
      ...(articles.map((article) => `${article.title} ${article.abstract}`) || []),
    ]
      .filter(Boolean)
      .join(' '),
  );

const POPULARITY_KEYWORDS = ['latinoam', 'regional', 'masivo', 'millones', 'comunidad', 'inclusi', 'social'];
const PRIORITY_KEYWORDS = ['salud', 'medic', 'financ', 'fraude', 'seguridad', 'clim', 'aliment', 'urgente'];
const DISSATISFACTION_KEYWORDS = ['informal', 'sin acceso', 'brecha', 'dolor', 'invisible', 'ineficiente', 'manual'];
const TANGIBILITY_KEYWORDS = ['plataforma', 'app', 'prototipo', 'piloto', 'dashboard', 'sistema'];
const INEVITABILITY_KEYWORDS = ['regulator', 'tendencia', 'crecimiento', 'obligatorio', 'compliance', 'sostenible'];
const NEGLECT_KEYWORDS = ['desatendido', 'informal', 'rural', 'nicho', 'no bancarizado', 'underserved'];

const scorePopularity = (text, idea, articles) => {
  const base = 4 + keywordHits(text, POPULARITY_KEYWORDS);
  const personaBonus = idea.targetPersona && idea.targetPersona.toLowerCase().includes('latino') ? 1.5 : 0;
  const articleBonus = Math.min(2, articles.length * 0.7);
  const signalBonus = Math.min(2, (idea.trendSignals?.length || 0) * 0.5);
  return clampScore(base + personaBonus + articleBonus + signalBonus);
};

const scorePriority = (text, idea) => {
  const base = 3 + keywordHits(text, PRIORITY_KEYWORDS) * 1.2;
  const urgencyFlags = /(urgente|crítico|must-have|imprescindible)/.test(text) ? 2 : 0;
  const validationBonus = Math.min(2, (idea.validationFocus?.length || 0) * 0.6);
  return clampScore(base + urgencyFlags + validationBonus);
};

const scoreDissatisfaction = (text, idea) => {
  const base = 3 + keywordHits(text, DISSATISFACTION_KEYWORDS) * 1.3;
  const painSignal = /(sin|falta|ausencia|informal)/.test(text) ? 1.5 : 0;
  const actionBonus = Math.min(2, (idea.actionSteps?.length || 0) * 0.4);
  return clampScore(base + painSignal + actionBonus);
};

const scoreTangibility = (text, idea) => {
  const base = 4 + keywordHits(text, TANGIBILITY_KEYWORDS);
  const stepsBonus = Math.min(3, (idea.actionSteps?.length || 0) * 0.8);
  const clarityBonus = idea.ideaSummary?.length > 320 ? 1 : 2;
  return clampScore(base + stepsBonus + clarityBonus);
};

const scoreInevitability = (text, articles) => {
  const base = 3 + keywordHits(text, INEVITABILITY_KEYWORDS);
  const recency = computeRecencyBoost(articles);
  return clampScore(base + recency + (articles.length >= 3 ? 1.5 : 0));
};

const scoreMarketNeglect = (text, articles) => {
  const base = 3 + keywordHits(text, NEGLECT_KEYWORDS) * 1.5;
  const scarcityBonus = articles.length <= 1 ? 2.5 : 1;
  const informalBonus = /informal/.test(text) ? 1.5 : 0;
  return clampScore(base + scarcityBonus + informalBonus);
};

const verdictFromScore = (score) => {
  if (score >= 45) return '✅ Excelente oportunidad';
  if (score >= 37) return '✅ Gran oportunidad';
  if (score >= 30) return '🟡 Oportunidad moderada';
  return '🔴 Oportunidad débil';
};

const scoreIdea = async (idea, articles = []) => {
  const corpus = buildCorpus(idea, articles);

  const popularity = scorePopularity(corpus, idea, articles);
  const priority = scorePriority(corpus, idea);
  const dissatisfaction = scoreDissatisfaction(corpus, idea);
  const tangibility = scoreTangibility(corpus, idea);
  const inevitability = scoreInevitability(corpus, articles);
  const marketNeglect = scoreMarketNeglect(corpus, articles);

  const rubric = [
    {
      id: 'popularity',
      label: 'Popularidad',
      score: popularity,
      description: '¿A cuántas personas afecta y qué tan amplio es el mercado objetivo?',
    },
    {
      id: 'priority',
      label: 'Prioridad',
      score: priority,
      description: '¿Es un problema urgente o imprescindible para los usuarios?',
    },
    {
      id: 'dissatisfaction',
      label: 'Nivel de Insatisfacción',
      score: dissatisfaction,
      description: '¿Las alternativas actuales son deficientes o inexistentes?',
    },
    {
      id: 'tangibility',
      label: 'Tangibilidad',
      score: tangibility,
      description: '¿Qué tan claro es el valor y el camino para entregarlo?',
    },
    {
      id: 'inevitability',
      label: 'Inevitabilidad',
      score: inevitability,
      description: '¿El problema se agrava con el tiempo o es impulsado por tendencias inevitables?',
    },
    {
      id: 'marketNeglect',
      label: 'Desatención del mercado',
      score: marketNeglect,
      description: '¿Qué tan desatendido está el segmento por los competidores actuales?',
    },
  ];

  const rawTotal = rubric.reduce((sum, item) => sum + item.score, 0);
  const normalizedTotal = Math.round((rawTotal / (rubric.length * 10)) * 50);

  return {
    rubric,
    rawTotal,
    totalScore: normalizedTotal,
    totalLabel: verdictFromScore(normalizedTotal),
    scale: '0-50',
  };
};

module.exports = {
  scoreIdea,
};
