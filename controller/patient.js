const appointmentschema = require("../models/appointmentschema");
const doctorschema = require("../models/doctorschema");
const patientschema = require("../models/patientschema");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require('dotenv').config();

exports.patregister = async (req, res) => {
    const { username, Name, password, confirmpassword, age, address, mobile } = req.body;

    if (!username || !Name || !password || !confirmpassword || !age || !address || !mobile) {
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
    try {
        const userexist = await patientschema.findOne({ "user_data.username": username });
        console.log(userexist, { "user_data.username": username });

        if (userexist) {
            return res.status(400).json({
                success: false,
                message: "Sorry Patient, You already exist"
            });
        }
        const hashpassword = await bcrypt.hash(password, 10);

        const userdata = await patientschema.create({
            user_data: {
                username,
                Name,
                password: hashpassword,
                confirmpassword: hashpassword
            },
            profile_data: {
                age,
                address,
                mobile
            }
        });

        res.status(200).json({
            success: true,
            data: userdata,
            message: "Hello Patient, You are successfully registered"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.patlogin = async(req , res)=>{
    const {username , password} = req.body;
    try{
     const userdata = await patientschema.findOne({"user_data.username":username})
     if(!userdata){
         res.status(400).json({
             success:false,
             message:"Sorry Patient , First Registered yourself"
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
         message:"Welcome Back Patient!!"
        })  
    } catch(error){
     res.status(400).json({
         success:false,
         message:error.message
        })  
    }
 }
 
 exports.getpat = async(req,res)=>{
    const token = req.headers.authorization?.split(' ')[1]
    const {username} = req.body;
    try{
        const patexist = await patientschema.findOne({_id:token , 'user_data.username':username})
        
        if(!patexist){
           return res.status(400).json({
                success:false,
                message:"Patient Not Registered!!"
               })  
        }

        res.status(200).json({
            success:true,
            message:"Patient found!!"
           })

    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
           })  
    }
   
}

exports.putpat = async(req,res)=>{
    const token = req.headers.authorization?.split(' ')[1]
    const {age , address , mobile} = req.body;
    const {id} = req.params
    try{
      const updateddata = await patientschema.findByIdAndUpdate({_id:id , token},{profile_data:{age, address , mobile,updatedAt:Date.now()}} ,{new:true})
      res.status(200).json({
        success:true,
        data:updateddata,
        message:"Wow Patient!! You Got Something Updated"
       })  
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
           })  
    }
   
}

exports.createpatappoint = async(req,res)=>{
    const token = req.headers.authorization?.split(' ')[1]
    const {appointment_date , patientusername,docusername } = req.body;
    try {
        const patient = await patientschema.findOne({ 'user_data.username': patientusername });
       const doctor = await doctorschema.findOne({'user_data.username': docusername})
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Create the appointment
        const appointdata = await appointmentschema.create({
            appointment_date: appointment_date,
            Patient: patient._id,
           doctor_assigned: doctor._id,
            token: token
        });

        res.status(200).json({
            success: true,
            data: appointdata,
            token: token,
            message: "Your Appointment created"
        });
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
           })  
    }
}