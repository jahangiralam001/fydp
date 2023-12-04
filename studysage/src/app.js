if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const multer = require("multer");
const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const { promisify } = require("util");

//ALL the DATABASE
require("./db/conn");
const Test = require("./models/subQwithmail");
const RegisterUser = require("./models/registerUser.js");





//for universar post
const port = process.env.PORT || 3000;

// Multer setup
const storage = multer.memoryStorage(); // Use memory storage for simplicity
const upload = multer({ storage: storage });



//declaring paths
const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");


app.use(express.json());
app.use(express.urlencoded({extended:false}));



app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views",templates_path);
hbs.registerPartials(partials_path);



// getting pages from templates/views
app.get("/", (req, res) => {
  res.render("landing_page");
});
// app.get("/login", (req, res) => {
//   res.render("login");
// });
// app.get("/register", (req, res) => {
//   res.render("register");
// });
app.get("/submit_question", (req, res) => {
  res.render("submit_question");
});
app.get("/after_post_question", (req, res) => {
  res.render("after_post_question");
});

app.get("/k", async (req, res) => {
  try {
      // Retrieve data from the database
      const landingpage_Q_data = await Test.find();
      res.render("k", {landingpage_Q : landingpage_Q_data });
  } catch (error) {
      res.status(500).send(error);
  }
});






//All the post data


// Modify the post route in app.js
app.post("/k", upload.single("file"), async (req, res) => {
  try {
    console.log(req.body);
    const landingpage_Q = new Test({
      email: req.body.email,
      topic: req.body.topic,
      question: req.body.question,
      req_time: req.body.req_time,
      file: {
        data: req.file.buffer.toString('base64'), // Convert buffer to base64 string
        contentType: req.file.mimetype,
      }
    });

    const result = await landingpage_Q.save();
    res.status(201).render("k", { landingpage_Q: result });
  } catch (error) {
    console.error("MongoDB Error:", error); // Log MongoDB-related errors
    res.status(400).send(error);
  }
});








//_________________Login and signup_
async function getUserByEmail(email) {
  return await RegisterUser.findOne({ email: email });
}

async function getUserById(id) {
  return await RegisterUser.findById(id);
}
 
 

initializePassport(
  passport,
  email => getUserByEmail(email),
  id => getUserById(id)
)

// initializePassport(
//   passport,
//   email => users.find(user => user.email === email),
//   id => users.find(user => user.id === id)
//   )



const users = []

app.use(express.urlencoded({extended: false}))

const sessionSecret = "secretkey";
app.use(session({
  secret: sessionSecret,
  resave: false, // We wont resave the session variable if nothing is changed
  saveUninitialized: false
}))
app.use(flash())
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))


app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});


// Configuring the register post functionality
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', 'Successfully logged in!');
      res.redirect('/');
    });
  })(req, res, next);
});

// app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
//   successRedirect: "/",
//   failureRedirect: "/login",
//   failureFlash: true
// }))
//chsdlfjdfdshfsd
// ////////////////________Register user data storing on database_______////////////////////////
app.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const registerUser = new RegisterUser({
          kk: Date.now().toString(), 
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
       
    });

    const result = await registerUser.save();
    res.status(201).render("login", { registerUser: result });
  } catch (error) {
    console.error("MongoDB Error:", error); 
    res.status(400).send(error);
    res.redirect("/register")
  }
});






// Routes
app.get('/', checkAuthenticated, (req, res) => {
  res.render("landingpage")
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render("login")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render("register")
})
// End Routes

// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/login')
//   })

app.delete("/logout", (req, res) => {
  req.logout(req.user, err => {
      if (err) return next(err)
      res.redirect("/")
  })
})

function checkAuthenticated(req, res, next){
  if(req.isAuthenticated()){
      return next()
  }
  res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
  if(req.isAuthenticated()){
      return res.redirect("/")
  }
  next()
}


//___________________________________________________________
// _____________________endlogin_____________________






app.listen(port, () => {
  console.log(`Your server is running at port no ${port}`);
});
