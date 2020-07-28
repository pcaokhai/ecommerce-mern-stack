import express from "express";
const router = express.Router();

import {
  create,
  productById,
  read,
  remove,
  update,
  list,
  listRelated,
  listCategories,
  listBySearch,
  photo,
  listSearch
} from "../controllers/product";
import { userById } from "../controllers/user";

import { isAdmin, requireSignin, isAuth } from "../controllers/auth";


router.get("/product/:productId", read);
router.get("/products/", list);
router.get("/products/related/:productId", listRelated);
router.get("/products/categories", listCategories);
router.get('/product/photo/:productId', photo)

//search by category and price range
router.post("/products/by/search", listBySearch);

//search products in the search bar
router.get("/products/search", listSearch);

//create new user
router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create);

// delete product
router.delete("/product/:productId/:userId", requireSignin, isAuth, isAdmin, remove);

//update product
router.put("/product/:productId/:userId", requireSignin, isAuth, isAdmin, update);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
