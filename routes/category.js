import express from "express";
const router = express.Router();

import { create, categoryById, read, update, remove, list } from "../controllers/category";
import { userById} from '../controllers/user'

import { isAdmin, requireSignin, isAuth } from '../controllers/auth';

router.get('/category/:categoryId', read);
router.get("/categories", list);
router.post('/category/create/:userId', requireSignin, isAuth, isAdmin, create);
router.put("/category/:categoryId/:userId", requireSignin, isAuth, isAdmin, update);
router.delete("/category/:categoryId/:userId", requireSignin, isAuth, isAdmin, remove);

router.param('categoryId', categoryById);
router.param('userId', userById);

module.exports = router;
