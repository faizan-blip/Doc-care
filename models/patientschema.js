const mongoose = require('mongoose')

const patschema = new mongoose.Schema({
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
         }
    },
    profile_data:{
        age:{
            type:Number,
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
    },
    patient_history:{
        admit_date:{
            type:Date,
        },
        symptomps:{
            type:String,
        },
        department:{
            type:String,
        },
        release_date:{
            type:Date,
        },
        assigned_doctor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'doc',
            required:true
        },
    }
})

module.exports = mongoose.model("pat" , patschema)