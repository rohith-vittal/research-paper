import { Router } from 'express';
import SavedPaper from '../models/SavedPaper.js';
import Note from '../models/Note.js';
import ReadingList from '../models/ReadingList.js';
import { isMongoConnected } from '../config/db.js';
import { memory, nextId } from '../services/store.js';

const router = Router();

router.get('/papers', async (req, res, next) => {
  try {
    const items = isMongoConnected()
      ? await SavedPaper.find().sort({ createdAt: -1 })
      : memory.savedPapers;
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/papers', async (req, res, next) => {
  try {
    if (isMongoConnected()) {
      const existing = await SavedPaper.findOne({ arxivId: req.body.arxivId });
      if (existing) return res.json(existing);
      const paper = await SavedPaper.create(req.body);
      return res.json(paper);
    }
    if (!memory.savedPapers.find((p) => p.arxivId === req.body.arxivId)) {
      memory.savedPapers.unshift({ _id: nextId(), ...req.body, createdAt: new Date() });
    }
    res.json(memory.savedPapers[0]);
  } catch (err) { next(err); }
});

router.delete('/papers/:id', async (req, res, next) => {
  try {
    if (isMongoConnected()) await SavedPaper.findByIdAndDelete(req.params.id);
    else memory.savedPapers = memory.savedPapers.filter((p) => p._id !== req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.get('/notes', async (req, res, next) => {
  try {
    const items = isMongoConnected() ? await Note.find().sort({ createdAt: -1 }) : memory.notes;
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/notes', async (req, res, next) => {
  try {
    if (isMongoConnected()) return res.json(await Note.create(req.body));
    const note = { _id: nextId(), ...req.body, createdAt: new Date() };
    memory.notes.unshift(note);
    res.json(note);
  } catch (err) { next(err); }
});

router.delete('/notes/:id', async (req, res, next) => {
  try {
    if (isMongoConnected()) await Note.findByIdAndDelete(req.params.id);
    else memory.notes = memory.notes.filter((n) => n._id !== req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.get('/lists', async (req, res, next) => {
  try {
    const items = isMongoConnected() ? await ReadingList.find().sort({ createdAt: -1 }) : memory.readingLists;
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/lists', async (req, res, next) => {
  try {
    if (isMongoConnected()) return res.json(await ReadingList.create(req.body));
    const list = { _id: nextId(), name: req.body.name, paperIds: req.body.paperIds || [], createdAt: new Date() };
    memory.readingLists.unshift(list);
    res.json(list);
  } catch (err) { next(err); }
});

export default router;
