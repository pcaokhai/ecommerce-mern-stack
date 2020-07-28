import Category from '../models/Category';
import { errorHandler } from '../helpers/dbErrorHandler'

// categoryId  middleware
export const categoryById = async (req, res, next, id) => {
    try {
        const category = await Category.findById(id);
        if (!category) {
          return res.status(400).json({ error: "Category does not exist" });
        }
        req.category = category;
        next();
    } catch (err) {
        console.log(err)
        if(err.kind === 'ObjectId') {
            return res.status(400).json({ error: "Category does not exist" });
        }
        res.status(500).json({error: 'Server Error'});
    }
}

// create a category
export const create = async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.json({category});
    } catch (err) {
        res.status(400).json({error: errorHandler(err)});
    }
}

// read a single category
export const read = (req, res) => {
    return res.json(req.category);
}

// update a category
export const update = async (req, res) => {
    try {
        const category = req.category;
        category.name = req.body.name;
        await category.save();
        res.json(category);
    } catch (err) {
        res.status(400).json({ error: errorHandler(err) });
    }
}

export const remove = async (req, res) => {
      try {
        const category = req.category;
        await category.remove();
        res.json({msg: "Category deleted"});
      } catch (err) {
        res.status(400).json({ error: errorHandler(err) });
      }
}


export const list = async (req, res) => {
    try {
        const categories = await await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(400).json({ error: errorHandler(err) });
    }
}