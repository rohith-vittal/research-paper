# ScholarAI — AI Research Literature Discovery Agent

A hackathon-ready full-stack app for discovering, analyzing, and organizing academic papers.

## Stack
- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose) with in-memory fallback when MongoDB is unavailable
- **Paper data:** Live arXiv API (real searches, real metadata, real abstracts)
- **Analysis:** Local extractive summarization / findings / methodology / datasets / limitations extraction (no fake data; upgradeable to an LLM via `OPENAI_API_KEY`)

## Setup
```bash
npm run install:all
cp backend/.env.example backend/.env   # edit MONGODB_URI / OPENAI_API_KEY as needed
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Architecture
```
backend/
  server.js            Express app entry
  config/db.js         Mongo connection + fallback
  models/              Mongoose models (SavedPaper, Note, ReadingList, SearchHistory)
  routes/              paper, library, chat, history routers
  services/            arxivService (real API), analysisService (extraction), store (in-memory fallback)
frontend/
  src/pages/           Search, PaperDetail (analysis + chat), Compare, Trends, Gaps, Library, History
  src/components/      PaperCard
  src/services/api.js  service layer for all backend calls
```

## Features
Paper search (live arXiv), abstract metadata, AI extractive summaries, key findings / methodology / dataset / limitation extraction, related paper cues via category + limitation mining, paper comparison table, trend analysis (charts), research-gap assistance, source-grounded chat over a paper's abstract, saved papers, notes, search history, PDF/arXiv source links.
