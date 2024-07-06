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
  })
  
module.exports = mongoose.model('appoint' , appointschema)