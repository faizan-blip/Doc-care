
const appointmentschema = require("../models/appointmentschema");
const doctorschema = require("../models/doctorschema");
const patientschema = require("../models/patientschema");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

require('dotenv').config();
const stripe = require('stripe')(process.env.Stripe_Sec)
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
           amount:doctor.profile_data.feeamount,
           docname:doctor.user_data.Name,
            token: token,
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

exports.patlinkpassword = async(req,res)=>{
    const {mobile} = req.body;
    try{
       const mobiledata = await patientschema.findOne({"profile_data.mobile":mobile})
       if(!mobiledata){
        return   res.status(400).json({
               success: false,
               message: "Patient Doesn't exist with this Mobile Number."
           });
       }
  const payload = {
   mobile: mobiledata.profile_data.mobile,
   id:mobiledata._id
  }
  const token = jwt.sign(payload ,process.env.JWT_SEC  , {
   expiresIn:"15m"
})
const link = `http://localhost:4000/api/resetpassword/${mobiledata._id}/${token}`
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

exports.patresetpassword = async (req, res) => {
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

        const pat = await patientschema.findOne({ _id: id });
        if (!pat) {
            return res.status(400).json({
                success: false,
                message: "Patient doesn't exist"
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
            if(decoded.id != pat.id){
                return res.status(400).json({
                    success: false,
                    message: "Invalid Link"
                });
            }
          }); 

          const isCurrentPassword = await bcrypt.compare(password,pat.user_data.password );

          if (isCurrentPassword) {
            return res.status(409).json({
              status: false,
              message: 'Cannot use the current password.',
            });
          }
          const hashpassword = await bcrypt.hash(password, 10);

          const update = await patientschema.findByIdAndUpdate( { _id: id },
            { $set: { "user_data.password": hashpassword } },
            { new: true })
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
};

exports.payment = async(req,res)=>{
    const {id} = req.params
    try{
         const patient = await patientschema.findOne({_id:id})
         if(!patient){
         return  res.status(500).json({
                success: false,
                message: 'Invalid Payment'
            });
         }
            const customer = await stripe.customers.create({
                name: patient.user_data.Name
            })
         const latestAppoinment = await appointmentschema.findOne({Patient:patient._id})
         if(!latestAppoinment){
            return  res.status(500).json({
                success: false,
                 message: 'No appointment found for the patient'
            });
         }
      
         const paymentIntent = await stripe.paymentIntents.create({
            amount: latestAppoinment.amount,
            currency: 'USD',
            customer: customer._id,
            description: `Appointment with ${latestAppoinment.docname}`,
            metadata: {
                appointment_id: latestAppoinment._id.toString(),
                patient_id: latestAppoinment.Patient.toString(),
                doctor_id: latestAppoinment.doctor_assigned.toString(),
                appointment_date: latestAppoinment.appointment_date.toISOString()
            }
        });
        res.status(200).json({
            success: true,
            paymentIntent: paymentIntent,
            message: "Payment intent created successfully"
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}