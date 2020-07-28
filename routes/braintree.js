import express from "express";
const router = express.Router();

import { userById } from '../controllers/user';
import { generateToken, processPayment } from '../controllers/braintree';
import { requireSignin, isAuth } from "../controllers/auth";


router.get('/braintree/getToken/:userId', requireSignin, isAuth, generateToken);
router.post('/braintree/payment/:userId', requireSignin, isAuth, processPayment);


router.param('userId', userById);

module.exports = router;