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

mongoose.connect("mongodb+srv://sdffsdfsdf@cluster0.u1l2oxj.dsfdf.net/sdfdsf", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connection successful to MongoDB Atlas");
  console.log("Connected to database:", mongoose.connection.db.databaseName);
}).catch((e) => {
  console.error("Error connecting to MongoDB Atlas:", e.message);
});
