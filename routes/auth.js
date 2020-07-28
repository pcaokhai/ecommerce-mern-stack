const express = require('express');
const router = express.Router();
import {validationResult} from 'express-validator';
import {userSignupValidator} from '../validator/index';

import { signup, 
    signin, 
    signout, 
    requireSignin } from '../controllers/auth';

//@route    POST /api/signup
//@desc     Sign up a user
//@access   Public
router.post('/signup', userSignupValidator, (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        // console.log(errors.errors)
        const firstError = errors.errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    signup(req, res);
});

//@route    POST /api/signin
//@desc     Sign in a user
//@access   Public
router.post('/signin', signin)

//@route    GET /api/signout
//@desc     sign out user
//@access   Public
router.get('/signout', signout)


module.exports = router;