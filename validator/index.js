import { check } from 'express-validator';

export const userSignupValidator = [
         check("name", "Name is required").notEmpty(),
         check("email", "Email must be between 3 to 32 characters")
           .matches(/.\@.+\..+/)
           .withMessage("Please enter a valid email")
           .isLength({
             min: 4,
             max: 32
           }),
         check("password", "Password is required")
           .notEmpty()
           .isLength({ min: 6 })
           .withMessage("Password must contain at least 6 characters")
           .matches(/\d/)
           .withMessage("Password must contain a number")
       ];