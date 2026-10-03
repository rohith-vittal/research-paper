import { Router } from 'express';
import { getArxivPaper } from '../services/arxivService.js';
import { answerFromPaper } from '../services/analysisService.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { arxivId, question } = req.body;
    if (!arxivId || !question) return res.status(400).json({ error: 'arxivId and question are required' });
    const paper = await getArxivPaper(arxivId);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    res.json(answerFromPaper(paper, question));
  } catch (err) { next(err); }
});

export default router;
