const doctorschema = require("../models/doctorschema");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const appointmentschema = require("../models/appointmentschema");
const { resetmessage } = require("./resetmessage");
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
        const docexist = await doctorschema.findOne({_id:token})
        console.log(token , docexist);
        if(!docexist){
           return res.status(400).json({
                success:true,
                message:"Doc not found!!"
               })  
        }
        res.status(200).json({
            success:true,
            message:"Doc found!!"
           })  
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

exports.getappoint = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        const doctor = await doctorschema.findOne({ _id: token });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        const patientappointment = await appointmentschema.find({ doctor_assigned: doctor._id });
        if (!patientappointment || patientappointment.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No Appointments for today"
            });
        }

        res.status(200).json({
            success: true,
            data: patientappointment,
            message: "Doc !! You are going to be busy now.."
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.doclinkpassword = async(req,res)=>{
     const {mobile} = req.body;
     try{
        const mobiledata = await doctorschema.findOne({"profile_data.mobile":mobile})
        if(!mobiledata){
         return   res.status(400).json({
                success: false,
                message: "Doc Doesn't exist with this Mobile Number."
            });
        }
   const payload = {
    mobile: mobiledata.profile_data.mobile,
    id:mobiledata._id
   }
   const token = jwt.sign(payload ,process.env.JWT_SEC  , {
    expiresIn:"15m"
})
const link = `http://localhost:4000/api/resetpassword${mobiledata._id}/${token}`
console.log(link);
await resetmessage(link , mobile)
res.status(200).json({
    success: true,
    data: link,
    message: "Reset Link Send Successfully!!"
})
     } catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        });
     }
}

exports.docresetpassword = async(req,res)=>{
    const { id, token } = req.params;
    const { password, confirmpassword } = req.body;

    try {
        // Check if passwords match
        if (!password || !confirmpassword || password !== confirmpassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match or are not provided."
            });
        }

        const doctor = await doctorschema.findOne({ _id: id });
        if (!doctor) {
            return res.status(400).json({
                success: false,
                message: "Doc doesn't exist"
            });
        }

        jwt.verify(token, process.env.JWT_SEC , function(err, decoded) {
            console.log(decoded.id)
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired token."
                });
            }
            if(decoded.id != doctor.id){
                return res.status(400).json({
                    success: false,
                    message: "Invalid Link"
                });
            }
          }); 

          const isCurrentPassword = await bcrypt.compare(password,doctor.user_data.password );

          if (isCurrentPassword) {
            return res.status(409).json({
              status: false,
              message: 'Cannot use the current password.',
            });
          }
          const hashpassword = await bcrypt.hash(password, 10);

          const update = await doctorschema.findByIdAndUpdate({_id:id , token},{user_data:{password:hashpassword}})
           res.status(200).json({
            success: true,
    data: update,
    message: "Password Reset Successfully"
           })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
