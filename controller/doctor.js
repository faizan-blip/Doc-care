const doctorschema = require("../models/doctorschema");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const appointmentschema = require("../models/appointmentschema");
require("dotenv").config()

exports.docregistration = async (req, res) => {
    const { username, Name, password, confirmpassword, department, address, mobile } = req.body;

    if (!username || !Name || !password || !confirmpassword || !department || !address || !mobile) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (password !== confirmpassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match"
        });
    }
    const userexist = await doctorschema.findOne({ "user_data.username": username });
    console.log(userexist, { "user_data.username": username });

    if (userexist) {
        return res.status(400).json({
            success: false,
            message: "Sorry Doc, You already exist"
        });
    }
    try {
        const hashpassword = await bcrypt.hash(password, 10);

        const userdata = await doctorschema.create({
            user_data: {
                username,
                Name,
                password: hashpassword,
                confirmpassword: hashpassword
            },
            profile_data: {
                department,
                address,
                mobile
            }
        });

        res.status(200).json({
            success: true,
            data: userdata,
            message: "Hello Doctor, You are successfully registered"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.doclogin = async(req , res)=>{
   const {username , password} = req.body;
   try{
    const userdata = await doctorschema.findOne({"user_data.username":username})
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
    try{
        const docexist = await doctorschema.findOne({token})
        console.log(token , docexist);
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
    if (!token || !id) {
         res.status(400).json({
            success: false,
            message: 'Token and id are required'
        });
    }

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
    if(!token){
        res.status(400).json({
            success: false,
            message: 'No appointment is there for today'
        });
    }
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