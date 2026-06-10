import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
   try {
      const reqError = validationResult(req);
      
      if (!reqError.isEmpty()) {
          return res.status(400).json({ errors: reqError.errors[0] });
      }
      next(); 
   } catch (error) {
      console.error("Error in validator middleware:", error);
      return res.status(500).json({ message: "Internal server error" });
   }
}
