
import mongoose from "mongoose";

const visitorSessionSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    pageViews: {
      type: Number,
      default: 0,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    location: {
      country: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      region: {
        type: String,
        default: "",
      },
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
  },
  { timestamps: true }
);

visitorSessionSchema.index({
  "location.country": 1,
  createdAt: -1,
});

const VisitorSession =
  mongoose.models.VisitorSession ||
  mongoose.model("VisitorSession", visitorSessionSchema);

export default VisitorSession;
