
import { errorHandler } from "../helpers/dbErrorHandler";
import { Order, CartItem } from '../models/Order';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('add-key');

export const orderById = async (req, res, next, id) => {
    try {
        const order = await Order.findById(id).populate('products.product', 'name price')
        req.order = order
        next()
    } catch (error) {
        res.status(400).json({error: errorHandler(error)});
    }
}

export const create = async (req, res) => {
    // console.log("CREATE ORDER", req.body)
    try {
        req.body.order.user = req.profile;
        const order = new Order(req.body.order);
        await order.save()

        const emailData = {
            to: 'kaloraat@gmail.com',
            from: 'noreply@ecommerce.com',
            subject: `A new order is received`,
            html: `
            <p>Customer name:</p>
            <p>Total products: ${order.products.length}</p>
            <p>Total cost: ${order.amount}</p>
            <p>Login to dashboard to the order in detail.</p>
        `
        };
        sgMail.send(emailData);

        //send to buyer
        const emailData2 = {
            to: order.user.email,
            from: 'noreply@ecommerce.com',
            subject: `You order is in process`,
            html: `
            <h1>Hey ${req.profile.name}, Thank you for shopping with us.</h1>
            <h2>Total products: ${order.products.length}</h2>
            <h2>Transaction ID: ${order.transaction_id}</h2>
            <h2>Order status: ${order.status}</h2>
            <h2>Product details:</h2>
            <hr />
            ${order.products
                .map(p => {
                    return `<div>
                        <h3>Product Name: ${p.name}</h3>
                        <h3>Product Price: ${p.price}</h3>
                        <h3>Product Quantity: ${p.count}</h3>
                </div>`;
                })
                .join('--------------------')}
            <h2>Total order cost: ${order.amount}<h2>
            <p>Thank your for shopping with us.</p>
        `
        };
        sgMail.send(emailData2)
        res.json(order);
    } catch (err) {
        res.status(400).json({error: errorHandler(err)});
    }
}

export const listOrders = (req, res) => {
    Order.find()
        .populate('user', '_id name address')
        .sort('-created')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(error)
                });
            }
            res.json(orders);
        });
};

export const getStatusValues = (req, res) => {
    res.json(Order.schema.path('status').enumValues)
}

exports.updateOrderStatus = (req, res) => {
    Order.update(
        { _id: req.body.orderId },
        { $set: { status: req.body.status } }, 
        (err, order) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(order);
    });
};
