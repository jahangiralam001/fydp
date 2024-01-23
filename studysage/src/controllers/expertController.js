const User = require("../models/registerUser");
const bcrypt = require('bcrypt');


const loadexLogin = async (req, res) => {
    try {
        res.render('expert_login'); // Correct view name with relative path
    } catch (error) {
        console.log(error.message);
    }
};

const verifyLogin = async(req,res)=>{
    try{

        const email = req.body.email;
        const password = req.body.password;
        

    const expertlogData = await User.findOne({email:email});

    if(expertlogData){
       const passwordMatch = await bcrypt.compare(password,expertlogData.password)
      if(passwordMatch){
        if(expertlogData.is_admin ===0){
        res.render('expert_login',{message:"Email and pass incrt"});

        }
        else{
            req.session.user_id = expertlogData._id;
            console.log(`User ${email} authenticated successfully as ${expertlogData.is_admin}`);
           
            res.redirect("/expert/expertDashboard");
        }

      }
      else{
        res.render('expert_login',{message:"Email and pass incrt"});
         
      }
    }
    else{
        res.render('expert_login',{message:"Email and pass incrt"});
    }




    }catch(error){
        console.log(error.message);
    }
}



const loadexDashboard = async(req,res)=>{
    try{
        res.render('expertDashboard');

    }catch(error){
        console.log(error.message);
    }
}


const logout = async (req, res) => {
    try {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/expert');
        });
    } catch (error) {
        console.log(error.message);
    }
};



module.exports = {
    loadexLogin,
    verifyLogin,
    loadexDashboard,
    logout
};
