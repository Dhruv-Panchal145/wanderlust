const User = require("../models/user");

module.exports.signup = (req,res) => {
 res.render("users/signup.ejs");
}

module.exports.rendersignup = async(req,res) => {
try{
   let{ username, email, password } = req.body;
   const newUser = new User({email, username});
   const registerUser = await User.register(newUser , password);
   console.log(registerUser);
   req.login(registerUser,(err) => {
      if(err) {
         return next(err);
      }
         req.flash("success", "Welcome to wanderlust!");
   res.redirect("/listing");
   });

} catch(e) {
     req.flash("error", e.message);
     res.redirect("/signup");
}
}

module.exports.login = (req,res) => {
    res.render("users/login.ejs");
}

module.exports.renderLogin = async(req,res) => {
   req.flash("success","Welcome back to Wanderlust !");
   const redirectUrl = res.locals.redirectUrl || "/listing";
   res.redirect(redirectUrl);
}

module.exports.logout = (req,res,next) =>  {
     req.logout((err) => {
       if(err) {
         return next(err);
       }
       req.flash("success", "you are logged out!");
       res.redirect("/listing");
     })
  }