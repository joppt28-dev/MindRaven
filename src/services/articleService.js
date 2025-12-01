const fetchFn = async (...args) => {
  const { default: fetch } = await import('node-fetch');
  return fetch(...args);
};

const SEMANTIC_BULK_URL = 'https://api.semanticscholar.org/graph/v1/paper/search/bulk';
const SEMANTIC_RELEVANCE_URL = 'https://api.semanticscholar.org/graph/v1/paper/search';
const CROSSREF_URL = 'https://api.crossref.org/works';
const SEMANTIC_API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;
const RECENCY_WINDOW_YEARS = 6;
const MIN_YEAR = new Date().getFullYear() - RECENCY_WINDOW_YEARS;
const SEMANTIC_RATE_LIMIT_MS = 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastSemanticJob = Promise.resolve();
let lastSemanticRequestAt = 0;

const scheduleSemanticCall = (fn) => {
  const job = lastSemanticJob.then(async () => {
    const now = Date.now();
    const delay = Math.max(0, lastSemanticRequestAt + SEMANTIC_RATE_LIMIT_MS - now);
    if (delay) {
      await wait(delay);
    }
    lastSemanticRequestAt = Date.now();
    return fn();
  });

  lastSemanticJob = job.catch(() => {});
  return job;
};

const summarizeAbstract = (abstract = '') =>
  abstract.length > 480 ? `${abstract.slice(0, 477)}...` : abstract;

const formatAuthors = (authors = []) =>
  authors
    .map((author) => author.name || `${author.given || ''} ${author.family || ''}`.trim())
    .filter(Boolean)
    .slice(0, 5);

const toNumericYear = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
};

const getPaperYear = (paper = {}) => {
  const directYear = toNumericYear(paper.year);
  if (directYear) return directYear;
  if (paper.publicationDate) {
    const year = toNumericYear(String(paper.publicationDate).slice(0, 4));
    if (year) return year;
  }
  return undefined;
};

const normalizeSemanticScholar = (papers = []) =>
  papers.map((paper) => ({
    id: paper.paperId,
    title: paper.title,
    abstract: summarizeAbstract(paper.abstract || 'Resumen no disponible.'),
    url: paper.url || paper.openAccessPdf?.url,
    authors: formatAuthors(paper.authors),
    year: getPaperYear(paper),
    venue: paper.journal?.name || paper.venue || 'Semantic Scholar',
    source: 'Semantic Scholar',
  }));

const normalizeCrossRef = (items = []) =>
  items.map((item) => ({
    id: item.DOI,
    title: item.title?.[0],
    abstract: summarizeAbstract(item.abstract ? item.abstract.replace(/<\/?jats:p>/g, '') : 'Resumen no disponible.'),
    url: item.URL,
    authors: formatAuthors(item.author),
    year: item.created?.['date-parts']?.[0]?.[0] || item.issued?.['date-parts']?.[0]?.[0],
    venue: item['container-title']?.[0],
    source: 'CrossRef',
  }));

const buildSupportRationale = (article = {}, ideaContext = {}) => {
  const { ideaTitle, innovationAngle, targetPersona } = ideaContext;
  const venue = article.venue ? ` publicado en ${article.venue}` : '';
  const year = article.year ? ` (${article.year})` : '';

  const hooks = [];
  if (innovationAngle) {
    hooks.push(`conecta con el enfoque "${innovationAngle}"`);
  }
  if (targetPersona) {
    hooks.push(`aporta evidencia para ${targetPersona.toLowerCase()}`);
  }
  if (!hooks.length && ideaTitle) {
    hooks.push(`refuerza la propuesta "${ideaTitle}"`);
  }
  if (!hooks.length) {
    hooks.push('aporta evidencia complementaria para la idea');
  }

  return `El artículo${venue}${year} ${hooks.join(' y ')}.`;
};

const filterRecentArticles = (articles = []) =>
  articles.filter(({ year }) => typeof year === 'number' && year >= MIN_YEAR);

const dedupeArticles = (articles = []) => {
  const seen = new Set();
  return articles.filter((article) => {
    const normalizedTitle = (article.title || '').toLowerCase();
    const key = `${normalizedTitle}|${article.year || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const postProcessArticles = (articles = []) => dedupeArticles(filterRecentArticles(articles));

const textMatchesKeywords = (text = '', keywords = []) => {
  if (!keywords.length) return false;
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
};

const prioritizeArticles = (articles = [], keywords = []) => {
  if (!keywords.length) return articles;
  const prioritized = articles.filter((article) =>
    textMatchesKeywords(`${article.title} ${article.abstract}`, keywords),
  );
  return prioritized.length ? prioritized : articles;
};

// ====== NUEVA FUNCIÓN: VALIDAR RELEVANCIA DEL ARTÍCULO ======
const computeRelevanceScore = (article = {}, ideaContext = {}) => {
  const { ideaTitle = '', ideaSummary = '', innovationAngle = '', targetPersona = '' } = ideaContext;
  
  const articleText = `${article.title} ${article.abstract}`.toLowerCase();
  const contextText = `${ideaTitle} ${ideaSummary} ${innovationAngle} ${targetPersona}`.toLowerCase();
  
  // Extraer frases clave y palabras individuales del contexto
  const phrases = [
    ideaTitle,
    innovationAngle,
    targetPersona
  ].filter(p => p && p.length > 5);
  
  const contextKeywords = contextText
    .split(/[^a-záéíóúüñ0-9]+/)
    .filter(word => word.length > 4)
    .map(word => word.trim());
  
  // Puntuación base: coincidencia de palabras clave
  let score = 0;
  const keywordMatches = [];
  
  contextKeywords.forEach(keyword => {
    if (articleText.includes(keyword)) {
      keywordMatches.push(keyword);
      score += 5; // 5 puntos por cada palabra clave
    }
  });
  
  // Bonus por coincidencia de frases completas (mucho más importante)
  let phraseMatches = 0;
  phrases.forEach(phrase => {
    const phraseWords = phrase.toLowerCase()
      .split(/[^a-záéíóúüñ0-9]+/)
      .filter(w => w.length > 3);
    
    if (phraseWords.length >= 2) {
      // Si hay coincidencia de al menos 2 palabras de la frase
      const matchedWords = phraseWords.filter(w => articleText.includes(w));
      if (matchedWords.length >= 2) {
        score += 20; // 20 puntos por coincidencia de frase temática
        phraseMatches++;
      }
    }
  });
  
  // Bonus especial por coincidencias de términos médicos/técnicos
  const medicalTerms = ['rehabilitación', 'gamificación', 'paciente', 'terapia', 'virtual', 'IA', 'inteligencia artificial', 'personalización'];
  const technicalMatches = medicalTerms.filter(term => articleText.includes(term)).length;
  score += technicalMatches * 8;
  
  // Bonus si el artículo es reciente
  const currentYear = new Date().getFullYear();
  const yearDifference = currentYear - (article.year || currentYear);
  if (yearDifference <= 3) score += 10;
  if (yearDifference <= 5) score += 5;
  
  // Normalizar a 0-100
  score = Math.min(100, Math.max(0, score));
  
  // Umbral: necesita al menos 2 coincidencias significativas
  const hasSignificantMatch = keywordMatches.length >= 3 || phraseMatches >= 1 || technicalMatches >= 2;
  
  return {
    score,
    keywordMatches: keywordMatches.length,
    totalKeywords: contextKeywords.length,
    phraseMatches,
    technicalMatches,
    isRelevant: hasSignificantMatch,
  };
};

const filterByRelevance = (articles = [], ideaContext = {}, minScore = 40) => {
  const validated = articles.map(article => ({
    ...article,
    relevance: computeRelevanceScore(article, ideaContext),
  }));
  
  // Logging para diagnosticar validación
  /* eslint-disable no-console */
  console.log(`[ArticleService] Validando ${articles.length} artículos contra idea: "${ideaContext.ideaTitle}"`);
  validated.slice(0, 15).forEach(article => {
    const status = article.relevance.isRelevant && article.relevance.score >= minScore ? '✓' : '✗';
    console.log(
      `${status} "${article.title.substring(0, 60)}..." (score: ${article.relevance.score.toFixed(0)}%, phrases: ${article.relevance.phraseMatches}, tech: ${article.relevance.technicalMatches})`
    );
  });
  const filteredCount = validated.filter(a => a.relevance.isRelevant && a.relevance.score >= minScore).length;
  console.log(`[ArticleService] ${filteredCount} de ${articles.length} artículos son relevantes (umbral: ${minScore}%)\n`);
  /* eslint-enable no-console */
  
  // Filtrar por puntuación mínima y ordenar por relevancia descendente
  return validated
    .filter(article => article.relevance.isRelevant && article.relevance.score >= minScore)
    .sort((a, b) => b.relevance.score - a.relevance.score);
};

const MAX_SEMANTIC_TERMS = 6;

const buildSemanticQuery = (query = '') => {
  const sanitized = query?.trim();
  if (!sanitized) return '';

  const quotedPhrases = sanitized.match(/"([^"]+)"/g) || [];
  const stripped = sanitized.replace(/"([^"]+)"/g, ' ');
  const tokens = stripped
    .split(/[^A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 4);

  const candidates = [
    ...quotedPhrases.map((phrase) => phrase.replace(/^"|"$/g, '').trim()),
    ...tokens,
  ].filter(Boolean);

  if (!candidates.length) {
    return sanitized.includes(' ') ? `"${sanitized}"` : sanitized;
  }

  const unique = [];
  const seen = new Set();
  for (const candidate of candidates) {
    const key = candidate.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(candidate);
    if (unique.length >= MAX_SEMANTIC_TERMS) break;
  }

  const formatTerm = (term) => (/\s/.test(term) ? `(${term})` : term);
  const [required, ...optional] = unique;
  const requiredPart = required ? `+${formatTerm(required)}` : '';
  const optionalPart = optional.length ? `(${optional.map(formatTerm).join(' | ')})` : '';
  return [requiredPart, optionalPart].filter(Boolean).join(' ').trim();
};

const semanticHeaders = () => (SEMANTIC_API_KEY ? { 'x-api-key': SEMANTIC_API_KEY } : undefined);

const fetchSemanticScholarBulk = async (query) => {
  const url = new URL(SEMANTIC_BULK_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('fields', 'title,abstract,url,authors,year,venue,journal,publicationDate,openAccessPdf');
  url.searchParams.set('year', `${MIN_YEAR}-`);
  url.searchParams.set('sort', 'publicationDate:desc');

  const headers = semanticHeaders(); // S2 Graph API authenticates via x-api-key
  return scheduleSemanticCall(async () => {
    const response = await fetchFn(url, { headers });
    if (!response.ok) {
      throw new Error('Semantic Scholar no disponible');
    }

    const data = await response.json();
    return normalizeSemanticScholar(data.data || []);
  });
};

const fetchSemanticScholarRelevance = async (query) => {
  const url = new URL(SEMANTIC_RELEVANCE_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('limit', '20');
  url.searchParams.set('offset', '0');
  url.searchParams.set('fields', 'title,abstract,url,authors,year,venue,journal,publicationDate,openAccessPdf');
  url.searchParams.set('year', `${MIN_YEAR}-`);

  const headers = semanticHeaders();
  return scheduleSemanticCall(async () => {
    const response = await fetchFn(url, { headers });
    if (!response.ok) {
      throw new Error('Semantic Scholar relevance no disponible');
    }

    const data = await response.json();
    return normalizeSemanticScholar(data.data || []);
  });
};

const fetchSemanticScholar = async (query) => {
  const semanticQuery = buildSemanticQuery(query);
  if (!semanticQuery) return [];

  const bulk = await fetchSemanticScholarBulk(semanticQuery);
  if (bulk.length) {
    return bulk;
  }

  return fetchSemanticScholarRelevance(semanticQuery);
};

const fetchCrossRef = async (query) => {
  const url = new URL(CROSSREF_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('rows', '5');

  const response = await fetchFn(url);
  if (!response.ok) {
    throw new Error('CrossRef no disponible');
  }

  const data = await response.json();
  return normalizeCrossRef(data.message?.items || []);
};

const fetchArticles = async (primaryQuery, keywords = [], fallbackQuery = '', ideaContext = {}) => {
  const semanticQuery = primaryQuery?.trim() || fallbackQuery?.trim() || '';

  if (!semanticQuery) {
    return [];
  }

  try {
    // Solo usar Semantic Scholar
    const semantic = await fetchSemanticScholar(semanticQuery);
    
    // Post-procesar (recientes + deduplicar)
    const processed = postProcessArticles(semantic);
    
    // NUEVA VALIDACIÓN: Filtrar por relevancia con respecto a la idea
    const relevant = filterByRelevance(processed, ideaContext, 40);
    
    // Si hay pocas artículos relevantes, intentar búsqueda fallback
    let final = relevant;
    if (final.length < 3 && fallbackQuery && fallbackQuery !== primaryQuery) {
      const fallbackSemanticQuery = buildSemanticQuery(fallbackQuery);
      if (fallbackSemanticQuery) {
        const fallbackResults = await fetchSemanticScholar(fallbackQuery);
        const fallbackProcessed = postProcessArticles(fallbackResults);
        const fallbackRelevant = filterByRelevance(fallbackProcessed, ideaContext, 35); // Umbral más bajo para fallback
        final = [...relevant, ...fallbackRelevant].slice(0, 8);
      }
    }
    
    // Tomar máximo 8 artículos relevantes
    return final.slice(0, 8).map((article) => ({
      ...article,
      supportRationale: buildSupportRationale(article, ideaContext),
    }));
  } catch (error) {
    console.warn('Error fetching articles from Semantic Scholar:', error.message);
    return [];
  }
};

module.exports = {
  fetchArticles,
};
