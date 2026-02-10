const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/api/auth/google/callback`
          : "http://localhost:5000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
            user.authProvider = "google";
            user.profilePicture =
              user.profilePicture || profile.photos[0]?.value;
            await user.save();
            return done(null, user);
          }

          const newUser = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value,
            authProvider: "google",
          });

          await newUser.save();
          done(null, newUser);
        } catch (error) {
          console.error("Google OAuth error:", error);
          done(error, null);
        }
      },
    ),
  );
  console.log("✅ Google OAuth configured");
} else {
  console.log(
    "⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)",
  );
  console.log("   Regular email/password authentication will still work.");
  console.log("   See GOOGLE_OAUTH_SETUP.md to enable Google Sign-In.");
}

module.exports = passport;
