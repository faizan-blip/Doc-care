const mongoose = require('mongoose')

const docschema = new mongoose.Schema({
    user_data:{
         username:{
            type:String,
            required:true
         },
         Name:{
            type:String,
            required:true
         },
         password:{
            type:String,
            required:true
         },
         confirmpassword:{
            type:String,
            required:true
         },
         createdAt:{
            type:Date,
            default:Date.now()
         },
       
    },
    profile_data:{
        department:{
            type:String,
            required:true
         },
         address:{
            type:String,
            required:true
         },
         mobile:{
            type:Number,
            required:true
         },
         updatedAt:{
            type:Date,
         }
    },
})


module.exports = mongoose.model("doc" , docschema)