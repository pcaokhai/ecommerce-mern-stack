import User from '../models/User'
import {errorHandler} from '../helpers/dbErrorHandler';
import chalk from 'chalk';

const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');

// sign up user
export const signup = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save()

        user.salt = undefined;
        user.hashed_password = undefined;

        res.json(user)
    } catch (err) {
        res.json({error: errorHandler(err)})
    }
    
};

// sign in a user
export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body)
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({error: "User with that email does not exist. Please sign up"});
        }
    // if user is found, make sure the email and password are matched
    // create authenticate method in user model
        if(!user.authenticate(password)){
            return res.status(401).json({
                error: 'Email and password dont match'
            })
        }
    
    // generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // persist the token as 't' in the cookie with expiry day
    res.cookie('t', token, {expire: new Date() + 10000});
    // return response with user and token to the frontend user
    const {_id, name, role} = user;
    return res.json({token, user: {_id, name, email, role}});

    } catch (err) {
        console.log(err)
        res.status(500).json({error: 'Server error.'})
    }
}

// signout user
export const signout = (req, res) => {
    res.clearCookie('t');
    res.json({msg: "Signout success"})
}

export const requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'auth' //contain the payload in jwt
});

// check if the user has been logged in
export const isAuth = (req, res, next) => {
    // console.log(req.auth)
    let user = req.profile && req.auth && req.profile._id == req.auth._id
    if(!user) {
        return res.status(403).json({error: 'Access denied'});
    }
    next();
}

// check if user is admin
export const isAdmin = (req, res, next) => {
    if(req.profile.role === 0) {
        return res.status(403).json({error: "Admin resource! Access denied"});
    }
    next();
}