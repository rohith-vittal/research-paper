import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    paperId: { type: String, index: true },
    paperTitle: String,
    content: String,
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model('Note', noteSchema);
