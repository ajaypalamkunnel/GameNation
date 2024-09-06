import passport from "passport";
import { Strategy as GoogleStrategy} from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
import User from "../model/userSchema.mjs";

passport.use(
    new GoogleStrategy({
        clientID:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:'/auth/google/callback'
    },


    async(accessToken, refreshToken, profile, done)=>{
        try {

             //----------- Extract email from profile -------------------

             const email = profile.emails[0].value;

             //------------ Check if the user already exists ------------

            let user = await User.findOne({ email })


            if(!user){
                user = new User({
                    name:profile.displayName,
                    email : profile.emails[0].value,
                    googleID: profile.id
                })
                await user.save()
            }
            done(null,user)
            
        } catch (error) {
            done(error,null)
            
        }
    }
)
)

// Serialize and deserialize user for session handling
passport.serializeUser((user, done) => {
    done(null, user.id);
  });

passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
  
export default passport;

