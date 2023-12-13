const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")




function initialize(passport, getUserByEmail, getUserById){
    // Function to authenticate users
const authenticateUsers = async (email, password, done) => {
    try {
        const user = await getUserByEmail(email);
        console.log(user);

        if (user == null) {
            return done(null, false, { message: "No user found with that email or not registered yet" });
        }

        const passMatch = await bcrypt.compare(password, user.password);

        if (passMatch) {
            if (user.is_verified == 0) {
                return done(null, false, { message: "Verify mail" });
            } else {
                return done(null, user);
                //console.log(user);
            }
        } else {
            return done(null, false, { message: "Password Incorrect" });
        }
    } catch (e) {
        console.log(e);
        return done(e);
    }
}


    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUsers))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize