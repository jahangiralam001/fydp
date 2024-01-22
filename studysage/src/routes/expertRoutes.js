const express = require("express");
const path = require("path");
const expert_route = express();



const session = require("express-session");
const configEX = require("../config/configex");
expert_route.use(session({ secret: configEX.sessionSecret }));

const bodyParser = require("body-parser");
expert_route.use(bodyParser.json());
expert_route.use(bodyParser.urlencoded({ extended: true }));

// Path declaring
const static_path = path.resolve(__dirname, "../../public");
const templates_path = path.resolve(__dirname, "../../templates/views/expert");

expert_route.use(express.static(static_path));
expert_route.set("view engine", "ejs");
expert_route.set("views", templates_path);

//authentication expert
const auth = require('../middleware/expertauth');


//controller
const expertController = require("../controllers/expertController");
const expertPostController = require("../controllers/expertPostController");


//controller_get
expert_route.get('/',auth.isLogout, expertController.loadexLogin);
expert_route.post('/',expertController.verifyLogin);
expert_route.get('/home', auth.isLogin,expertController.loadexDashboard);
expert_route.get('/logout',auth.isLogin,expertController.logout);

//controller_post_get
expert_route.get('/seeQuestion',expertPostController.getRandomQuestion);




expert_route.get('*',function(req,res){
    res.redirect('/expert');
  });




module.exports = expert_route;
