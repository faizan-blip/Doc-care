const mongoose = require('mongoose')

const appointschema = new mongoose.Schema({
    Patient:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'pat',
      required:true,
    },
    appointment_date: {
      type: Date,
      required: true
  },
  doctor_assigned:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'doc',
    required:true
  },
  docname:{
    type:String,
  },
  amount:{
    type:Number,
  }
  })
  
module.exports = mongoose.model('appoint' , appointschema)