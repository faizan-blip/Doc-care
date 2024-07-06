const doctorschema = require("../models/doctorschema");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const appointmentschema = require("../models/appointmentschema");
require("dotenv").config()
exports.registration = async(req,res)=>{
       const {username , Name , password , confirmpassword , department , address , mobile} =req.body
       try{
        const hashpassword = bcrypt.hash(password,10)
        const userexist = await doctorschema.findOne({user_data:{username}})
        if(userexist){
            res.status(400).json({
                success:false,
                message:"Sorry Doc , You have already exist"
               })  
        }
        const userdata = await doctorschema.create({user_data:{username,Name,password:hashpassword,confirmpassword:hashpassword},profile_data:{department,address,mobile}})
       res.status(200).json({
        success:true,
        data:userdata,
        message:"Hello Doctor , You are Successfully registered"
       })  
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
           })  
        }
      
}

exports.login = async(req , res)=>{
   const {username , password} = req.body;
   try{
    const userdata = await doctorschema.findOne({user_data:{username}})
    if(!userdata){
        res.status(400).json({
            success:false,
            message:"Sorry Doc , First Registered yourself"
           })  
    }
    const isPasswordValid = await bcrypt.compare(password , userdata.user_data.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials.",
      });
    }
    const payload = {
        username:username,
        name:userdata.user_data.Name
    }
    const token = jwt.sign(payload ,process.env.JWT_SEC  , {
        expiresIn:"2h"
    })
    res.status(200).json({
        success:true,
        data:userdata.user_data,
        token:token,
        message:"Welcome Back DOC!!"
       })  
   } catch(error){
    res.status(400).json({
        success:false,
        message:error.message
       })  
   }
}


exports.getdoc = async(req,res)=>{
    const token = req.headers.authorization?.split(' ')[1]
    const {username} = req.body;
    try{
        const docexist = await doctorschema.find({token , user_data:username})
        if(docexist){
            res.status(200).json({
                success:true,
                message:"Doc found!!"
               })  
        }
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
           })  
    }
   
}

exports.putdoc = async(req,res)=>{
    const token = req.headers.authorization?.split(' ')[1]
    const {department , address , mobile} = req.body;
    const {id} = req.params
    try{
      const updateddata = await doctorschema.findByIdAndUpdate({_id:id , token},{profile_data:{department, address , mobile,updatedAt:Date.now()}} ,{new:true})
      res.status(200).json({
        success:true,
        data:updateddata,
        message:"Wow Doc!! You Got Something Updated"
       })  
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
           })  
    }
   
}

exports.getappoint = async(req,res)=>{
    const token = req.headers.authorization?.split(' ')[1]
    try{
        const patientappointment = await appointmentschema.find({token })
        res.status(200).json({
            success:true,
            data:patientappointment,
            message:"Doc !! You are Going to busy now.."
           })  
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
           })  
    }

}