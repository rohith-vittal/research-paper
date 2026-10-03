import mongoose from 'mongoose';

const savedPaperSchema = new mongoose.Schema(
  {
    arxivId: { type: String, index: true },
    title: String,
    authors: [String],
    abstract: String,
    published: Date,
    categories: [String],
    url: String,
    pdfUrl: String,
    source: { type: String, default: 'arxiv' },
  },
  { timestamps: true }
);

export default mongoose.models.SavedPaper || mongoose.model('SavedPaper', savedPaperSchema);
