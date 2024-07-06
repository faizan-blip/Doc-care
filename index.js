const express = require('express')
const db = require('./config/database')
const app = express()
require("dotenv").config()
const Port = process.env.PORT
app.use(express.json())

db()

app.listen(Port,()=>{
console.log(`APP IS LISTENING AT ${Port}`);
})