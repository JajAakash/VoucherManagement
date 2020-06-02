const mongoose=require('mongoose')

const Schema=mongoose.Schema;

const voucherSchema=new Schema({
    code:String,
    pin:String,
    genTime:Date,
    email:String,
    usage:Number,
    status:String,
    //expiry:Boolean,
    voucherAmount:Number,
    redeemedAmount:Number,
    lastUsed:Date
})

module.exports=mongoose.model('voucher',voucherSchema,'VOUCHER')