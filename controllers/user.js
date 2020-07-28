import User from '../models/User';
import {Order} from '../models/Order';

import { errorHandler } from "../helpers/dbErrorHandler";

export const userById = async (req, res, next, id) => {
    try {
        const user = await User.findById(id).select('-hashed_password -salt');
        if(!user) {
            return res.status(400).json({error: "User not found"});
        }
        req.profile = user;
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server error"});
    }
}

export const read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}

export const update = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({_id: req.profile._id}, {$set: req.body}, {new: true});
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user);
    } catch (err) {
        console.log(err);
        res.status(400).json({error: "You are not authorized to perform this action"});
    }
}

export const addOrderToUserHistory = async (req, res, next) => {
    let history = [];

    req.body.order.products.forEach((item) => {
        history.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            category: item.category,
            quamtity: item.count,
            transaction_id: req.body.order.transaction_id,
            amount: req.body.order.amount
        })
    })

    try {
        User.findOneAndUpdate({_id: req.profile._id}, {$push: {history: history}}, {new: true});
        next();
    } catch (error) {
        res.status(400).json({error: 'Could not update user purchase history'})
    }
}

exports.purchaseHistory = (req, res) => {
    Order.find({ user: req.profile._id })
        .populate('user', '_id name')
        .sort('-created')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(orders);
        });
};
