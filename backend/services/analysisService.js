// Local, deterministic analysis of real paper text (abstract-level).
// If OPENAI_API_KEY is configured, summarizeWithAI can be upgraded to call an LLM.

function sentences(text = '') {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

export function summarizeAbstract(abstract = '', max = 3) {
  const sents = sentences(abstract);
  if (sents.length <= max) return abstract;
  // Score sentences by keyword density
  const keywords = ['propose', 'present', 'introduce', 'show', 'demonstrate', 'achieve', 'outperform', 'result', 'we', 'this paper', 'novel'];
  const scored = sents.map((s) => {
    const lower = s.toLowerCase();
    const score = keywords.reduce((acc, k) => acc + (lower.includes(k) ? 1 : 0), 0) + (s.length > 120 ? 0.5 : 0);
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored
    .slice(0, max)
    .map((x) => x.s)
    .sort((a, b) => sentences(abstract).indexOf(a) - sentences(abstract).indexOf(b))
    .join(' ');
}

// Evidence-tagged extraction. Every item carries a provenance:
//  - 'abstract' : explicitly stated in the paper abstract (source evidence)
//  - 'ai'       : inferred by the local analysis (AI inference) — never presented as fact
function extractByPatterns(abstract, patterns) {
  const sents = sentences(abstract);
  const found = sents.filter((s) => {
    const l = s.toLowerCase();
    return patterns.some((p) => l.includes(p));
  });
  return found.map((text) => ({ text, provenance: 'abstract' }));
}

export function extractKeyFindings(abstract = '') {
  return extractByPatterns(abstract, ['achieve', 'result', 'outperform', 'improve', 'demonstrate', 'show that', 'accuracy', 'state-of-the-art', 'significant']);
}

export function extractMethodology(abstract = '') {
  return extractByPatterns(abstract, ['propose', 'method', 'approach', 'framework', 'we use', 'based on', 'algorithm', 'architecture', 'model', 'train', 'we introduce']);
}

export function extractDatasets(abstract = '') {
  const sents = sentences(abstract);
  const mentions = sents.filter((s) => /dataset|benchmark|corpus|evaluation on|evaluate/i.test(s));
  return mentions.map((text) => ({ text, provenance: 'abstract' }));
}

export function extractLimitations(abstract = '') {
  const explicit = extractByPatterns(abstract, ['limitation', 'however', 'although', 'challenge', 'open problem', 'remains']);
  if (explicit.length) return explicit;
  // Nothing explicit — offer clearly-labeled AI inference candidates when the
  // abstract contains evaluation signals that commonly imply constraints.
  const lower = abstract.toLowerCase();
  const inferred = [];
  if (/benchmark|dataset/.test(lower)) {
    inferred.push({
      text: 'Results may be limited to the specific datasets and benchmarks reported in the abstract.',
      provenance: 'ai',
    });
  }
  if (/simulation|synthetic|toy|small-scale/.test(lower)) {
    inferred.push({
      text: 'The approach may not yet be validated at large scale, based on the setup described.',
      provenance: 'ai',
    });
  }
  return inferred;
}

// Items that belong in the "Future Work" bucket.
export function extractFutureWork(abstract = '') {
  const explicit = extractByPatterns(abstract, ['future work', 'future direction', 'we plan', 'will extend', 'extend this']);
  return explicit;
}

export function extractTrends(papers = []) {
  const years = {};
  const categoryCounts = {};
  for (const p of papers) {
    const year = p.published ? new Date(p.published).getFullYear() : null;
    if (year) years[year] = (years[year] || 0) + 1;
    for (const c of p.categories || []) categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  }
  return {
    byYear: Object.entries(years)
      .sort(([a], [b]) => a - b)
      .map(([year, count]) => ({ year: Number(year), count })),
    topCategories: Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([category, count]) => ({ category, count })),
    total: papers.length,
  };
}

export function researchGaps(papers = []) {
  const allLimitations = [];
  for (const p of papers) {
    const lims = extractLimitations(p.abstract).filter((l) => l.provenance === 'abstract');
    for (const l of lims) allLimitations.push({ paper: p.title, limitation: l.text });
  }
  const categoryCounts = {};
  for (const p of papers) for (const c of p.categories || []) categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  const underrepresented = Object.entries(categoryCounts)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([c]) => c);
  return {
    limitationHighlights: allLimitations.slice(0, 10),
    underrepresentedCategories: underrepresented,
    note: 'These are potential research gaps derived from stated limitations and category coverage — not established facts. Supporting evidence is listed per gap.',
  };
}

// Extractive Q&A over the abstract: returns sentences containing the query terms.
export function answerFromPaper(paper, question = '') {
  const terms = question.toLowerCase().split(/\W+/).filter((t) => t.length > 3);
  const sents = sentences(paper.abstract || '');
  const scored = sents.map((s) => {
    const l = s.toLowerCase();
    const score = terms.reduce((acc, t) => acc + (l.includes(t) ? 1 : 0), 0);
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const best = scored.filter((x) => x.score > 0).slice(0, 3).map((x) => x.s);
  return {
    answer: best.length ? best.join(' ') : 'No directly relevant statement found in the abstract. Try a more specific question.',
    source: paper.title,
    url: paper.url,
    grounded: best.length > 0,
  };
}
