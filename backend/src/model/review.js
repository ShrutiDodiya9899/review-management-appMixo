import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    productId: { type: String, required: true },
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    riskScore: { type: Number, default: 0 },
    flags: [{ type: String }],
    moderatorReason: { type: String },
  },
  { timestamps: true, versionKey: false }
);

const Review = model("Review", reviewSchema);
export default Review;