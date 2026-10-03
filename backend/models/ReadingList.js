import mongoose from 'mongoose';

const readingListSchema = new mongoose.Schema(
  {
    name: String,
    paperIds: [String],
  },
  { timestamps: true }
);

export default mongoose.models.ReadingList || mongoose.model('ReadingList', readingListSchema);
