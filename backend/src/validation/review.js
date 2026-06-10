import { body , query } from "express-validator";

export const reviewValidationRules = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isString().withMessage('Product ID must be a string')
    .trim(),

  body('author')
    .notEmpty().withMessage('Author name is required')
    .isString().withMessage('Author name must be a string')
    .trim(),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('text')
    .notEmpty().withMessage('Review text is required')
    .isString().withMessage('Review text must be a string')
    .trim(),
];

export const getReviewValidationRules = [
  query('page')
    .notEmpty().withMessage('Page is required')
    .isInt({ min: 1 }).withMessage('Page must be more than 0')
    .trim(),
  query('limit')
    .notEmpty().withMessage('Limit is required')
    .isInt({ min: 1 }).withMessage('Limit must be more than 0')
    .trim(),
];


export const updateReviewValidationRules = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
     body('text')
    .notEmpty().withMessage('Review text is required')
    .isString().withMessage('Review text must be a string')
    .trim(),
];
