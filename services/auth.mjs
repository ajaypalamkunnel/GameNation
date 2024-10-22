import passport from "passport";
import { Strategy as GoogleStrategy} from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
import User from "../model/userSchema.mjs";

passport.use(
    new GoogleStrategy({
        clientID:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        //callbackURL:'/auth/google/callback',
        callbackURL:'https://gamenation.online/auth/google/callback',
        state:true
    },


    async(accessToken, refreshToken, profile, done)=>{
        try {

             //----------- Extract email from profile -------------------

             const email = profile.emails[0].value;
             
             console.log("Google email:", email);
             

             //------------ Check if the user already exists ------------

            let user = await User.findOne({ email })

            console.log("I am user----",user);

            if(user){
              if(!user.isVerified){
                console.log("User is blocked:", email);
                return done(null,false,{message:"Your account is blocked." })
              }
            
            
            // Update Google ID if it's missing or has changed
            if(!user.googleID||user.googleID!==profile.id){
              user.googleID = profile.id;
              user.isVerified = true;
              await user.save()
            }
            return done(null,user)
          }else{
            const newUser = new User({
              username:profile.displayName,
              email:email,
              googleID:profile.id,
              isVerified:true

            })
            await newUser.save()
            return done(null,newUser)

          }
            
            
        } catch (error) {
          console.error("Error during Google authentication:", error);
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

