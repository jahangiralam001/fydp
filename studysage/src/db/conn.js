// const mongoose = require("mongoose");

// mongoose.connect("mongodb://103.253.176.50/30/studysage",{
//     useNewUrlParser:true,
//     useUnifiedTopology:true,
//     useCreateIndex:true
// }).then(() => {
//     console.log("connectiong successful to StudySage");
// }).catch((e) =>{
// console.log("no connection")
// })

const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://sage:sage123@cluster0.u1l2oxj.mongodb.net/", {
  
    
}).then(() => {
    console.log("Connection successful to MongoDB Atlas");
}).catch((e) => {
    console.error("Error connecting to MongoDB Atlas:", e.message);
});