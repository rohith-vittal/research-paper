import { Router } from 'express';
import { searchArxiv, getArxivPaper } from '../services/arxivService.js';
import {
  summarizeAbstract,
  extractKeyFindings,
  extractMethodology,
  extractDatasets,
  extractLimitations,
  extractFutureWork,
  extractTrends,
  researchGaps,
} from '../services/analysisService.js';
import SearchHistory from '../models/SearchHistory.js';
import { isMongoConnected } from '../config/db.js';
import { memory } from '../services/store.js';

const router = Router();

router.get('/search', async (req, res, next) => {
  try {
    const { q, max = 12 } = req.query;
    if (!q) return res.status(400).json({ error: 'q is required' });
    const papers = await searchArxiv(q, Number(max));
    if (isMongoConnected()) {
      await SearchHistory.create({ query: q, resultCount: papers.length });
    } else {
      memory.searchHistory.unshift({ _id: Date.now().toString(), query: q, resultCount: papers.length, createdAt: new Date() });
    }
    res.json(papers);
  } catch (err) {
    next(err);
  }
});

router.get('/paper', async (req, res, next) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const paper = await getArxivPaper(id);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    res.json(paper);
  } catch (err) {
    next(err);
  }
});

router.get('/paper/analyze', async (req, res, next) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const paper = await getArxivPaper(id);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    res.json({
      ...paper,
      summary: summarizeAbstract(paper.abstract),
      keyFindings: extractKeyFindings(paper.abstract),
      methodology: extractMethodology(paper.abstract),
      datasets: extractDatasets(paper.abstract),
      limitations: extractLimitations(paper.abstract),
      futureWork: extractFutureWork(paper.abstract),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/trends/analysis', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q is required' });
    const papers = await searchArxiv(q, 30);
    res.json(extractTrends(papers));
  } catch (err) {
    next(err);
  }
});

router.get('/gaps/analysis', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q is required' });
    const papers = await searchArxiv(q, 20);
    res.json(researchGaps(papers));
  } catch (err) {
    next(err);
  }
});

export default router;
