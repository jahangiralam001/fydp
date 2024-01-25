const mongoose = require("mongoose");


const posted_qSchema = new mongoose.Schema({
    student_id:{
        type:String,
        
    },
    sub: {
        type: String,
        required: true,
    },
    university: {
        type: String,
        required: true,
    },
    question: {
        type: String,
         
    },
    file: {
        data: Buffer, // Store file data as Buffer
        contentType: String, // Store file content type
    }, 
    answer:{
        type:String,
         
    },
    answer_file:{
         
        data: Buffer, // Store file data as Buffer
        contentType: String, // Store file content type
    },
    question_id:{
        type:String,
     
    },
    date:{
        type:Date,
         
    },
    is_answered:{
        type: Number,
        default:0
    },
    answered_by:{
        type: String,
          
    },




});

const uploaded_QA = mongoose.model("uploaded_QA",posted_qSchema);

module.exports = uploaded_QA;