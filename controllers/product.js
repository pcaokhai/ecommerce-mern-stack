import Product from "../models/Product";
import { errorHandler } from "../helpers/dbErrorHandler";

import fs from 'fs';
import formidable from 'formidable';
import _ from 'lodash';

// get a single product by id
export const read =  (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
}

// productById middleware
export const productById = async (req, res, next, id) =>{
    try {
        const product = await (await Product.findById(id)).populate('category');
        if(!product){
            return res.status(400).json({ error: "Product not found" });
        }

        req.product = product;
        next();
    } catch (err) {
        console.log(err)
        res.status(500).json({error: "Server error"});
    }
}

// craate a new product
export const create = async (req, res) => {
  try {
    // let product 
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if(err){
            return res.status(400).json({error: 'Image could not be upload'});
        }

        // validate fields
        const { name, description, price, category, quantity, shipping} = fields;
        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: "All fields are required"
            })
        }

        let product = new Product(fields);

        if(files.photo) {
            if(files.photo.size > 2500000) {
                return res.status(400).json({error: "Image should be less than 2.5Mb in size"});
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        await product.save();
        res.json(product);
    });
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};

export const remove = async (req, res) => {
    try {
        let product = req.product;
        await product.remove();
        res.json({msg: "Product removed successfully"});
    } catch (err) {
        console.log(err)
        res
          .status(400)
          .json({ error: errorHandler(err) });
    }
};

// update a product
export const update = async (req, res) => {
  try {
    // let product
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Image could not be upload" });
      }

      // validate fields
      /* const { name, description, price, category, quantity, shipping } = fields;
      if (
        !name ||
        !description ||
        !price ||
        !category ||
        !quantity ||
        !shipping
      ) {
        return res.status(400).json({
          error: "All fields are required"
        });
      } */

      let product = req.product;
      product = _.extend(product, fields);

      if (files.photo) {
        if (files.photo.size > 2500000) {
          return res
            .status(400)
            .json({ error: "Image should be less than 2.5Mb in size" });
        }
        product.photo.data = fs.readFileSync(files.photo.path);
        product.photo.contentType = files.photo.type;
      }

      await product.save();
      res.json(product);
    });
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};


/**
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

 export const list = async (req, res) => {
   let order = req.query.order ? req.query.order : 'asc';
   let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
   let limit = req.query.limit ? parseInt(req.query.limit) : 6;

   try {
      const products = await Product.find()
                              .select("-photo")
                              .populate("category")
                              .sort([[sortBy, order]])
                              .limit(limit);

      res.json(products);
   } catch (err) {
     console.log(err)
     res.status(400).json({error: "Products not found"})
   }  
 }

 /**
 * it will find the products based on the req product category
 * other products that has the same category, will be returned
 */
 export const listRelated = async (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  try {
    const products = await Product.find({
                                    _id: { $ne: req.product },
                                    category: req.product.category
                                  })
                                    .select('-photo')
                                    .limit(limit)
                                    .populate("category", "_id name");
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Products not found" });
  }
 }

 export const listCategories = async (req, res) => {
  try {
    const products = await Product.distinct('category', {});
    res.json(products)
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Products not found" });
  }
 }

 /**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */
export const listBySearch = async (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for(let key in req.body.filters) {
    if(req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1]
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  console.log(order, sortBy, limit, skip, req.body.filters);
  console.log("findArgs", findArgs);

  try {
    const products = await Product.find(findArgs)
                            .select('-photo')
                            .populate('category')
                            .sort([[sortBy, order]])
                            .skip(skip)
                            .limit(limit)
    
    res.json({size: products.length, products})
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Products not found" });
  }
}

export const photo = async (req, res, next) => {
  if(req.product.photo.data) {
    res.set('Content-Type', req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
}

// search by query string in the search bar
export const listSearch = async (req, res) => {
  // create query object to hold search value and category value
  const query = {};
  // assign search value to query.name
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
    // assign category value to query.category
    if (req.query.category && req.query.category != 'All') {
      query.category = req.query.category;
  }

    try {
      const products = await Product.find(query).select('-photo');
      res.json(products);
    } catch (err) {
      res.status(400).json({error: errorHandler(err)});
    }
  }
}

// update product quantity sold fields when a product is sold
exports.decreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map(item => {
      return {
          updateOne: {
              filter: { _id: item._id },
              update: { $inc: { quantity: -item.count, sold: +item.count } }
          }
      };
  });

  Product.bulkWrite(bulkOps, {}, (error, products) => {
      if (error) {
          return res.status(400).json({
              error: 'Could not update product'
          });
      }
      next();
  });
};
