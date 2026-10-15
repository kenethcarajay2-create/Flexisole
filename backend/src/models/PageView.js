
import mongoose from "mongoose";

const pageViewSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    path: {
      type: String,
      required: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

pageViewSchema.index({ createdAt: -1 });

export default mongoose.model("PageView", pageViewSchema);
