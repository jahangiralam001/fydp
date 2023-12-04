// subQwithmail.js
const mongoose = require("mongoose");

//setting structers __object
const testSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    req_time: {
        type: Number,
        default: 30,
    },
    file: {
        data: Buffer, // Store file data as Buffer
        contentType: String, // Store file content type
    }, 
});

// Define the model using the schema__class
const Test = mongoose.model("Test", testSchema);

module.exports = Test;
