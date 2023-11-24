const express = require("express");
const path = require("path");
const app = express();
require("./db/conn");
const hbs = require("hbs");




//for universar post
const port = process.env.PORT || 3000;


//declaring paths
const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");


app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views",templates_path);
hbs.registerPartials(partials_path);

// getting pages from templates/views
app.get("/", (req, res) => {
  res.render("landing_page");
});

app.get("/submit_question", (req, res) => {
  res.render("submit_question");
});



app.listen(port, () => {
  console.log(`Your server is running at port no ${port}`);
});
