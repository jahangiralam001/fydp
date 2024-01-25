const mongoose = require("mongoose");


const dev_info = new mongoose.Schema({
    student_id:{
        type:String,
        
    },
    device:{
        type:String,
        
    },
    ip: {
        type: String
         
    },
    loginTime: {
        type:Date
         
    },
    location: {
        type: String
         
    }


});

const deviceinfo = mongoose.model("deviceinfo",dev_info);

module.exports = deviceinfo;