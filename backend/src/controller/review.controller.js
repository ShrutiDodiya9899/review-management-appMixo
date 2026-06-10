import Review from "../model/review.js";
import { calculateRisk } from "../utils/riskAnalyser.js";

export const createReviews = async (req, res) => {
  try {
    const { productId, author, rating, text } = req.body;

    const riskScore = await calculateRisk(text, author, productId);

    let status = "pending";
    let moderatorReason = "";

    if (riskScore >= 50) {
      status = "rejected";
      moderatorReason = "Automatically rejected: Risk score exceeded threshold";
    }

    // Create and save the review
    const newReview = new Review({
      productId,
      author,
      rating,
      text,
      status,
      riskScore,
      moderatorReason,
    });

    await newReview.save();

    return res.status(201).json({
      message: "Review Created Successfully",
      data: newReview,
    });
  } catch (error) {
    console.log("error while creating review", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      Review.countDocuments(),
      Review.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      data,
      total: totalPages,
      page,
      limit,
    });
  } catch (error) {
    console.log("error while get review", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, rating } = req.body;

    const existingReview = await Review.findById(id);
    if (!existingReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (text !== undefined) existingReview.text = text;
    if (rating !== undefined) existingReview.rating = rating;

    const updatedRiskScore = await calculateRisk(
      existingReview.text,
      existingReview.author,
      existingReview.productId,
    );

    existingReview.riskScore = updatedRiskScore;

    if (updatedRiskScore >= 50) {
      existingReview.status = "rejected";
      existingReview.moderatorReason =
        "Automatically rejected: Updated risk score exceeded threshold";
    } else {
      existingReview.status = "pending";
    }

    await existingReview.save();

    return res.status(200).json({
      message: "Review updated successfully",
      data: existingReview,
    });
  } catch (error) {
    console.error("Error while updating review:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { status: "approved", moderatorReason: "Approved by moderator" },
      { new: true },
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({
      message: "Review approved successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error while approving review:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { moderatorReason } = req.body;

    if (!moderatorReason) {
      return res
        .status(400)
        .json({ message: "Moderator reason is required for rejection" });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { status: "rejected", moderatorReason },
      { new: true },
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({
      message: "Review rejected successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error while rejecting review:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getScoreWiseReview = async (req, res) => {
  try {
    const { score_gt } = req.query;

    if (!score_gt) {
      return res
        .status(400)
        .json({ message: "score_gt query parameter is required" });
    }

    const highRiskReviews = await Review.find({
      riskScore: { $gt: Number(score_gt) },
    });

    return res.status(200).json({
      message: `Found ${highRiskReviews.length} reviews greater than ${score_gt}`,
      data: highRiskReviews,
    });
  } catch (error) {
    console.error("Error while fetching score reviews:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
