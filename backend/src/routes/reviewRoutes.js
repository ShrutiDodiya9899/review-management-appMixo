import express from 'express';
import { approveReview, createReviews, getScoreWiseReview, getReviews, rejectReview, updateReview } from '../controller/review.controller.js';
import {  getReviewValidationRules, reviewValidationRules, updateReviewValidationRules } from '../validation/review.js';
import { validateRequest } from '../middleware/review.js';

export const reviewRoute=express.Router()

reviewRoute.post("/",reviewValidationRules,validateRequest,createReviews)
reviewRoute.get("/",getReviewValidationRules,validateRequest,getReviews)
reviewRoute.put("/:id",updateReviewValidationRules,validateRequest, updateReview);
reviewRoute.post("/:id/approve",approveReview)
reviewRoute.post("/:id/reject",rejectReview)
reviewRoute.get("/falgged",getScoreWiseReview)




