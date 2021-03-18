const mongoose = require ('mongoose');


const patronHistory= mongoose.Schema({
    user_id:{
        type:String,required:true},
    secret_token:{
        type:Number,required:true},        
    full_name:{
        type:String,required:true},
    last_charge_date:{
        type:String,required:true},
    last_charge_status:{
        type:String,required:true},
    lifetime_support_cents:{
        type:Number,required:false},
    patron_status:{
        type:String,required:true},
    pledge_amount_cents:{
        type:Number,required:false},
    pledge_relationship_start:{
        type:String,required:true},

});

module.exports=mongoose.model('patron-history',patronHistory);