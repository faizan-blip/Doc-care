const mongoose = require('mongoose')
require("dotenv").config()

const db = ()=>{
    mongoose.connect(process.env.MONGO_URL , {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(()=>{
console.log("Mongodb connected successfully");
    }).catch((err)=>{
console.log(err.message);
process.exit(1);
    })
}
module.exports = db