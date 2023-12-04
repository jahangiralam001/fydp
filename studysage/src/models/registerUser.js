const mongoose = require("mongoose");

//setting structers __object
const registerSchema = new mongoose.Schema({
 
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    } 
});

// Define the model using the schema__class
const StudentData = mongoose.model("Student", registerSchema);

module.exports = StudentData;
