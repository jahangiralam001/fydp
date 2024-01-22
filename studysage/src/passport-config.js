const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")


// ... (other imports)

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUsers = async (email, password, done) => {
        try {
            const user = await getUserByEmail(email);

            if (user == null) {
                console.log(`User with email ${email} not found`);
                return done(null, false, { message: "No user found with that email or not registered yet" });
            }

            const passMatch = await bcrypt.compare(password, user.password);

            if (passMatch) {
                if (user.is_verified == 0) {
                    console.log(`User ${email} is not verified`);
                    return done(null, false, { message: "Verify mail" });
                } 
              
                else {
                    console.log(`User ${email} authenticated successfully`);
                    return done(null, user);
                }
            } else {
                console.log(`Password incorrect for user ${email}`);
                return done(null, false, { message: "Password Incorrect" });
            }
        } catch (e) {
            console.error(`Error during authentication: ${e}`);
            return done(e);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUsers));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });
}

module.exports = initialize;
