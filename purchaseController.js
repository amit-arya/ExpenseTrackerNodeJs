const RazorPay = require('razorpay');
const Order = require('../models/order');

exports.purchasePremium = async (req, res) =>{
    try{
        var rzp = new RazorPay({
            key_id: 'rzp_test_gSD9Xr03zfmyC4',
            key_secret: 'hxmcunMFZqbQtJmm8xi9yCXd'
        })

        const amount = 2500;

        rzp.orders.create({amount, currency: "INR"}, (err, order) => {
            if(err){
                throw new Error(JSON.stringify(err));
            }

            req.user.createOrder({ orderId: order.id, status: 'PENDING', userId:req.user.id}).then(()=>{
                return res.status(201).json({ order, key_id: rzp.key_id});
            }).catch(err => {
                throw new Error(err)
            })
        })
    } 
    catch(err){
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err})
    }
}

exports.updateTransaction = async (req, res) => {
    const { payment_id, order_id} = req.body;
    const order = await Order.findOne({where: {orderId: order_id}})

    try{
        const promise1 = order.update({ paymentId: payment_id, status:'SUCCESSFUL'})
        const promise2 = req.user.update({ ispremiumuser: true })

        Promise.all([promise1, promise2]).then(()=>{
            return res.status(202).json({success: true, message: "Transaction Successful"});
        }).catch((error)=>{
            throw new Error(error)
        })
    }
    catch(err){
        res.status(500).json({ error: err });
    }
}