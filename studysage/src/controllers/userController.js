// const express = require("express");
// const path = require("path");
// const app = express();
// const hbs = require("hbs");
// const multer = require("multer");
// const bcrypt = require("bcrypt") // Importing bcrypt package
// const passport = require("passport")

// const initializePassport = require("../passport-config")
// const flash = require("express-flash")
// const session = require("express-session")
// const methodOverride = require("method-override")
// const { promisify } = require("util");
// const nodemailer = require("nodemailer");

// require("../db/conn.js");
// const Test = require("../models/subQwithmail");
// const RegisterUser = require("../models/registerUser.js");
// const { Error } = require("mongoose");

// //declaring paths
// const static_path = path.join(__dirname, "../public");
// const templates_path = path.join(__dirname, "../templates/views");
// const partials_path = path.join(__dirname, "../templates/partials");


// const loginLoad = async(req,res)=>{
//     try{
//           res.render('login');
//     }catch(error){
//         console.log(error);
//     }
// }

// const verifyLogin = async(req,res)=>{
//     try{
//       const email = req.body.email;
//       const password = req.body.password;
  
//      const userData = await RegisterUser.find({email:email});
//      if(userData){
//       const passMatch = await bcrypt.compare(password, userData.password);
//        if(passMatch){
//           if(passMatch.is_verified === 0){
//             res.render('login',{message:"verify mail"});
//           }
//           else{
//             req.session.user_id = userData._id;
//             res.redirect('/');
//           }
//        }
//        else{
//         res.render('login',{message:"Email/pass wrong"});
//        }
//      }else{
//       res.render('login',{message:"Email/pass wrong"});
//      }
//     }catch(error){
//       console.log(error);
//     }
//   }

// const landingpage = async(req,res)=>{
//     try{
//        res.render('landingpage');
//     }
//     catch(error){
//        console.log(error);
//     }
// };


// module.exports = {
//     loginLoad,
//     landingpage
// }