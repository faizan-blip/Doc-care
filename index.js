const express = require('express')
const db = require('./config/database')
const path  = require('./router/route')
const app = express()
require("dotenv").config()
const Port = process.env.PORT
app.use(express.json())
app.use('/api' , path)
db()

app.listen(Port,()=>{
console.log(`APP IS LISTENING AT ${Port}`);
})