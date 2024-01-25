// aif (process.env.NODE_ENV !== "production") {
//   require("dotenv").config()
// }

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
const nodemailer = require("nodemailer");

//ALL the DATABASE
require("./db/conn");
const Test = require("./models/subQwithmail");
const RegisterUser = require("./models/registerUser.js");
const PostedQuestion = require("./models/postQuestion.js");





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
// app.set("view engine", "ejs");
app.set("view engine", "hbs");
app.set("views",templates_path);
hbs.registerPartials(partials_path);


//for sending mail for sending
const sendverifymail = async(name,email,user_id)=>{
  try{
      const transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS: true,
      auth:{
          user:"sdfdsfsda7@gmail.com",
          pass:"dfdgdfhh" 


      }
     });
     const mailOptions = {
      from : 'sdfdsfsda7@gmail.com',
      to: email,
      subject: 'For verification StudySage acount',
      html:'<p> Hii, '+name+', click here to verify <a href="http://localhost:3000/email_verified?id='+user_id+'"> Verify</a> your mail.</p>'
     }
     transporter.sendMail(mailOptions,function(error,info){
      if(error){
        console.log(error);
      }else{
        console.log("Email send:-",info.response);
      }
     })
    
  }catch(error){
    console.log(error.massage);
  }
}






// getting Routes from templates/views
// app.get("/", (req, res) => {
//   res.render("landing_page");
// });
// app.get("/Dashboard", (req, res) => {
//   res.render("Dashboard",{name:req.result.name});
// });
app.get("/submit_question", (req, res) => {
  res.render("submit_question");
});
// app.get("/after_post_question", (req, res) => {
//   res.render("after_post_question");
// });

app.get("/email_verified", async (req, res) => {
  const userId = req.query.id;
  try {
    if (!userId) {
      throw new Error("No user ID provided");
    }
    const updateInfo = await RegisterUser.updateOne({ _id: userId }, { $set: { is_verified: 1 } });
    console.log('Update Info:', updateInfo);
    if (updateInfo.matchedCount === 0) {
      throw new Error("No user found with the provided ID");
    }
    res.render("email_verified");
  } catch (error) {
    console.error("Verification failed. Error:", error);
    res.send("Verification failed. Error: " + error.message);
  }
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


app.use(express.urlencoded({extended: false}))

const sessionSecret = "secfetkey";
app.use(session({
  secret: sessionSecret,
  resave: false, // We wont resave the session variable if nothing is changed
  saveUninitialized: false
}))
app.use(flash());
app.use(passport.initialize()); 
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
      res.redirect('Dashboard');
    });
  })(req, res, next);
});

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
  successRedirect: "Dashboard",
  failureRedirect: "/login",
  failureFlash: true
}))
//chsdlfjdfdshfs
// ////////////////________Register user data storing on database_______////////////////////////
app.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const registerUser = new RegisterUser({
          
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
          is_admin:0,
          date: Date.now().toString(), 
    });

    const result = await registerUser.save();
    if(result){
      sendverifymail(req.body.name,req.body.email,result._id);
      // Use flash message and redirect instead of render
      req.flash("success", "Registration successful. Please verify your email.");
      res.redirect("/login");
    } else {
      // Use flash message for failure and redirect
      req.flash("error", "Registration failed.");
      res.redirect("/register");
    }
  } catch (error) {
    console.error("MongoDB Error:", error); 
    res.status(400).flash("error", "An error occurred. Please try again.");
    res.redirect("/register");
  }
});








// Routes
app.get("/Dashboard",checkAuthenticated, (req, res) => {
  res.render("Dashboard");
   
});
// app.get('/', checkNotAuthenticated, (req, res) => {
//   res.render("landingpage")
// })
app.get("/", checkNotAuthenticated, async (req, res) => {
  try {

    res.render("landing_page");
  } catch (error) {
    res.status(500).send(error);
  }
});
app.get('/login', checkNotAuthenticated, (req, res) => {
  console.log(req.flash('error'));
  res.render("login.hbs", { messages: req.flash('error') });
});


// app.get('/expret_login', (req, res) => {
//   res.render("expret_login")
// })

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render("register")
})


app.get("/after_post_q", (req, res) => {
  res.render("after_post_q");
});


// app.get("/after_post_question", checkAuthenticated, async (req, res) => {
//   try {
//     // Retrieve data from the database for the currently authenticated user
//     const currentUser = await req.user;

//     const postedQ = await PostedQuestion.findById(currentUser._id);
//     //console.log("sp_data:", student_p_Data);

    
//     res.render("after_post_question", { question_data: postedQ });
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });



 

app.post("/submit_question", upload.single("file"), async (req, res) => {
  try {
   

    // Ensure req.file is defined before accessing its properties
    const fileData = req.file ? req.file.buffer.toString('base64') : null;
    const contentType = req.file ? req.file.mimetype : null;

    console.log(req.body);

     
    
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const formattedTime = currentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    
    const currentUser = await req.user;
    const postedQ = new PostedQuestion({
      student_id: currentUser._id,
      sub: req.body.sub,
      university: req.body.university,
      question: req.body.question,
      file: {
        data: fileData,
        contentType: contentType,
      },
      answer: "",
      answer_file: {
        data: "",
        contentType: "",
      },
      question_id: req.body.question_id,
      date: `${formattedDate} ${formattedTime}`,
      is_answered: 0,
      answered_by: 0,
    });

    const result = await postedQ.save();
    res.status(201).render("after_post_q", { question_data: result });
  } catch (error) {
    console.error("MongoDB Error:", error);
    res.status(400).send(error);
  }
});

//------------------------------------
//EXpert profiling routers


const expertRoute = require('./routes/expertRoutes.js');
app.use('/expert',expertRoute);













//------------------------------------
//students profiling routers

app.get('/my_courses',checkAuthenticated, (req, res) => {
  res.render('student/my_courses');
});
app.get('/my_devices',checkAuthenticated, (req, res) => {
  res.render('student/my_devices');
});
app.get('/my_overview',checkAuthenticated, (req, res) => {
  res.render('student/my_overview');
});
app.get('/payment_method',checkAuthenticated, (req, res) => {
  res.render('student/payment_method');
});

app.get("/security", checkAuthenticated, async (req, res) => {
  try {
    // Retrieve data from the database for the currently authenticated user
    const currentUser = await req.user;

    // Log the user object
    //console.log("User", currentUser.email, "authenticated successfully");

    const student_p_Data = await RegisterUser.findById(currentUser._id);
    //console.log("sp_data:", student_p_Data);

    
    res.render("student/security", { sp_data: student_p_Data });
  } catch (error) {
    res.status(500).send(error);
  }
});
// app.get('/', (req, res) => {
//   res.render('');
// });


app.get("/student_profile", checkAuthenticated, async (req, res) => {
  try {
    // Retrieve data from the database for the currently authenticated user
    const currentUser = await req.user;

    // Log the user object
    //console.log("User", currentUser.email, "authenticated successfully");

    const student_p_Data = await RegisterUser.findById(currentUser._id);
    //console.log("sp_data:", student_p_Data);

    
    res.render("student/student_profile", { sp_data: student_p_Data });
  } catch (error) {
    res.status(500).send(error);
  }
});

// End Routes student routes

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
      return res.redirect("/Dashboard")
  }
  next()
}


//___________________________________________________________
// _____________________endlogin_____________________





app.listen(port, () => {
  console.log(`Your server is running at port no ${port}`);
});
