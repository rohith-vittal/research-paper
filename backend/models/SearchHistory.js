import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    query: String,
    resultCount: Number,
  },
  { timestamps: true }
);

export default mongoose.models.SearchHistory || mongoose.model('SearchHistory', searchHistorySchema);
