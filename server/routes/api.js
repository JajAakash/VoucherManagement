const jwt=require('jsonwebtoken')
const key=require('../config/key')
const express =require ('express');
const router =express.Router();
const Voucher = require('../models/voucher')
const mongoose=require('mongoose')
var randomstring = require("randomstring");
const bcrypt = require('bcrypt'); 
var email=require('../email/email')

const url=key.mongodb.dbURI;
mongoose.Promise=global.Promise;

mongoose.connect(url,function(err){
    if(err){
        console.log("Error !!!"+err);
    }
});


// Voucher generation
//function verifyUser for validating JWTCOUPON
// after providing header token we can simply write router as below 
//passing middlewear to checkJSONWEBTOKEN
//router.post('/coupon',verifyUser,async (req,res)=>{
router.post('/coupon',async (req,res)=>{

    var voucher=new Voucher();

    voucher.redeemedAmount=0;
    voucher.usage=0;
    voucher.email=req.body.email
    voucher.genTime=new Date();
    voucher.lastUsed=new Date();
    voucher.voucherAmount=req.body.voucherAmount;
    voucher.status="active";
    voucher.code="VCD"+randomstring.generate(10);
    const pin=randomstring.generate({
        length: 5,
        charset: 'alphabetic'
      });
      const salt= await bcrypt.genSalt();
      const encryptedpin=await bcrypt.hash(pin,salt)
      voucher.pin=encryptedpin;


      voucher.save(function(err,savedVoucher){
        if(err){
            console.log(err,"Error saving voucher")
        }
        else{
            email();
            savedVoucher.pin=pin;
            res.json(savedVoucher)
        }
    });

})


// voucher redeem
router.post('/redeem/coupon',(req,res)=>{
    Voucher.findOne({email:req.body.email}).then(async (authorizedUser)=>{
        if(authorizedUser){
            let code=req.body.code;
                
                if(! authorizedUser.code===req.body.code){
                    return res.status(401).send("Your coupon code is not valid")
                }
                
                if(! await bcrypt.compare(req.body.pin,authorizedUser.pin)){
                    
                    return res.status(401).send("Your PIN is not valid")
                }

                if(authorizedUser.genTime.getDate()<new Date()){
                    return res.status(200).send("Your Coupon has been expired!!")
                }

                if(authorizedUser.genTime.getDate()<new Date()){
                    return res.status(200).send("Your Coupon has been expired!!")
                }

                if(authorizedUser.usage>=5){
                    return res.status(404).send("Coupon not valid!!")
                }
                if(userAmount>(authorizedUser.voucherAmount-authorizedUser.redeemedAmount)){
                    return res.status(404).send("Coupon not valid!!")
                }
                

                else{

                    var voucher=new Voucher();

                    //usage=authorizedUser.usage+=1;

                    if(authorizedUser.usage<=5){
                        updatedstatus="partially redeemed"
                    }
                    
                    else{
                        updatedstatus="redeemed"
                    }
                    
                    updatedredeemedAmount=authorizedUser.redeemedAmount+req.body.userAmount
                    //voucher.save();

                    Voucher.findByIdAndUpdate(authorizedUser._id,
                        {
                        $set:{usage:authorizedUser.usage+=1,status:updatedstatus,redeemedAmount:updatedredeemedAmount,lastUsed:new Date()}
                        }
                        ,
                        {
                            new:true
                        },
                        function(err,updatevoucher){
                            if(err){
                                console.log("err while update",err)
                            }
                            else{
                                res.json(updatevoucher)
                            }
                        }
                       
                    )

                    
                }
             
        }
    })
})

// Get Voucher API


router.post('/vouchers',(req,res)=>{
    Voucher.find({email:req.body.email}).exec(function(err,voucher){
        if(err){
            console.log("error while fetching your voucher Details")
        }else{
            //vouchers[]=new Voucher();
            res.json(voucher)
        }
    })
})

router.post('/vouchers/status',(req,res)=>{
    Voucher.find({status:req.body.status}).exec(function(err,voucher){
        if(err){
            console.log("error while fetching your voucher Details")
        }else{
            //vouchers[]=new Voucher();
            res.json(voucher)
        }
    })
})


function verifyUser(req, res, next){
    if(! req.headers.authorization){
        return res.status(401).send('unauthorized request')
    }
    let token =req.headers.authorization.split(' ')[1]

    if(token==='null'){
        return res.status(401).send('unauthorized request')
    }
    let payload=jwt.verify(token, 'asdfghjk')

    if(! payload){
        return res.status(401).send('unauthorized request')   
    }

    req.userId=payload.subject
    next();
}

module.exports = router;