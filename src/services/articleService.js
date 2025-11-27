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
  const crossRefQuery = fallbackQuery?.trim() || primaryQuery?.trim() || '';

  const semanticPromise = semanticQuery ? fetchSemanticScholar(semanticQuery) : Promise.resolve([]);
  const crossPromise = crossRefQuery ? fetchCrossRef(crossRefQuery) : Promise.resolve([]);

  const [semanticResult, crossResult] = await Promise.allSettled([semanticPromise, crossPromise]);

  const semantic = semanticResult.status === 'fulfilled' ? semanticResult.value : [];
  const cross = crossResult.status === 'fulfilled' ? crossResult.value : [];

  const combined = postProcessArticles([...semantic, ...cross]);
  const prioritized = prioritizeArticles(combined, keywords);

  return prioritized.slice(0, 8).map((article) => ({
    ...article,
    supportRationale: buildSupportRationale(article, ideaContext),
  }));
};

module.exports = {
  fetchArticles,
};
