const express = require('express')
const router = express.Router()


const {docregistration,doclogin,getdoc,putdoc,getappoint} = require('../controller/doctor')
const {patregister,patlogin,getpat,putpat,createpatappoint} = require('../controller/patient')

router.post("/docregister" , docregistration)
router.post("/doclogin" , doclogin)
router.get("/getdoc/profile" , getdoc)
router.put("/updatedoc/:id" , putdoc)
router.get("/getappoint" , getappoint)

router.post("/patregister" , patregister)
router.post("/patlogin" , patlogin)
router.get("/getpat" , getpat)
router.put("/updatepat/:id" , putpat)
router.post("/createappoint" , createpatappoint)

module.exports = router