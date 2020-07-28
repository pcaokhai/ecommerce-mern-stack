import User from '../models/User';
import braintree from 'braintree';

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

export const generateToken = (req, res) => {
    gateway.clientToken.generate({}, (err, response) => {
        if(err){
            console.log(err)
            res.status(500).json({error: err})
        } else {
            res.send(response);
        }
    })
};

export const processPayment = (req, res) => {
    let nonceFromTheClient = req.body.paymentMethodNonce;
    let amountFromTheClient = req.body.amount;

    //charge
    let newTransaction = gateway.transaction.sale({
        amount: amountFromTheClient,
        paymentMethodNonce: nonceFromTheClient,
        options: {
            submitForSettlement: true
        }
    }, (err, result) => {
        if(err) {
            res.status(500).json({error: err})
        } else {
            res.json(result)
        }
    })
}