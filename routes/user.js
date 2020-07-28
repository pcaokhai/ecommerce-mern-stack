import express from 'express';
const router = express.Router();

import { requireSignin, isAuth, isAdmin } from "../controllers/auth";
import { userById, read, update, purchaseHistory } from '../controllers/user';

router.param('userId', userById);

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
    res.json({
        user: req.profile
    })
});

router.get('/user/:userId', requireSignin, isAuth, read);
router.put('/user/:userId', requireSignin, isAuth, update);
router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory);

module.exports = router;