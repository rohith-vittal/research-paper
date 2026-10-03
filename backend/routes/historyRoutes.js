import { Router } from 'express';
import SearchHistory from '../models/SearchHistory.js';
import { isMongoConnected } from '../config/db.js';
import { memory } from '../services/store.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const items = isMongoConnected()
      ? await SearchHistory.find().sort({ createdAt: -1 }).limit(50)
      : memory.searchHistory;
    res.json(items);
  } catch (err) { next(err); }
});

export default router;
